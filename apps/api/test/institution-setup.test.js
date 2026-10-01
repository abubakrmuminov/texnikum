const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} = require('@nestjs/common');
const { Reflector } = require('@nestjs/core');
const { validate } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const { UserRole } = require('@college/shared');

const { InstitutionService } = require('../dist/modules/institution/institution.service');
const { SetupController } = require('../dist/modules/institution/setup.controller');
const { PublicInstitutionController } = require('../dist/modules/institution/public-institution.controller');
const { AdminInstitutionController } = require('../dist/modules/institution/admin-institution.controller');
const { CompleteSetupDto } = require('../dist/modules/institution/dto/complete-setup.dto');
const { UpdateInstitutionDto } = require('../dist/modules/institution/dto/update-institution.dto');
const { RolesGuard } = require('../dist/modules/auth/guards/roles.guard');

// Мок фабрика для создания изолированного сервиса
function createMockInstitutionService(setupToken = 'valid-super-secret-setup-token-2026') {
  const configService = {
    get: (key) => {
      if (key === 'SETUP_TOKEN') return setupToken;
      return null;
    },
  };

  const supabaseService = {
    isReady: () => false,
    getClient: () => null,
  };

  const auditLogs = [];
  const auditService = {
    log: async (...args) => {
      auditLogs.push(args);
      return { id: 'audit-log-1', createdAt: new Date().toISOString() };
    },
  };

  const cache = new Map();
  const cacheService = {
    get: async (key) => cache.get(key) || null,
    set: async (key, val) => cache.set(key, val),
    del: async (key) => cache.delete(key),
  };

  const service = new InstitutionService(
    configService,
    supabaseService,
    auditService,
    cacheService,
  );

  return { service, auditLogs, cache };
}

const validSetupPayload = {
  setupToken: 'valid-super-secret-setup-token-2026',
  adminEmail: 'superadmin@texnikum2.uz',
  adminPassword: 'Password2026!Secure',
  adminFullName: 'Qosimov Anvar Rustamovich',
  nameUz: 'Fargʻona 2-son texnikumi',
  nameRu: 'Ферганский техникум № 2',
  shortNameUz: '2-son texnikum',
  shortNameRu: 'Техникум № 2',
  institutionType: 'texnikum',
  legalAddressUz: '150100, Fargʻona sh., Al-Fargʻoniy koʻchasi, 42-uy',
  legalAddressRu: '150100, г. Фергана, ул. Аль-Фергани, д. 42',
  mainPhone: '+998 (73) 244-00-00',
  admissionPhone: '+998 (73) 244-00-00',
  trustPhone: '1006',
  contactEmail: 'info@texnikum2.uz',
  admissionEmail: 'priem@texnikum2.uz',
  websiteDomain: 'texnikum2.uz',
  geoLatitude: 40.3864,
  geoLongitude: 71.7864,
  brandPrimaryColor: '#1e3a8a',
  stirInn: '302987654',
  bankName: 'Oʻzmilliybank Fargʻona filiali',
  bankAccount: '23402000300100001010',
  mfoCode: '00014',
  jshshirPinfl: '31205851234567',
  directorNameUz: 'Karimov Jasur',
  directorNameRu: 'Каримов Жасур',
  directorPhone: '+998 (73) 244-00-01',
};

describe('White-label Institution & Setup API Tests', () => {
  test('1. GET /setup/status returns { configured: false } on fresh install', async () => {
    const { service } = createMockInstitutionService();
    const controller = new SetupController(service);

    const status = await controller.getStatus();
    assert.deepStrictEqual(status, { configured: false });
  });

  test('2. Wrong setup token is rejected with UnauthorizedException (401)', async () => {
    const { service } = createMockInstitutionService();
    const controller = new SetupController(service);

    const badPayload = {
      ...validSetupPayload,
      setupToken: 'wrong-invalid-token',
    };

    await assert.rejects(
      async () => {
        await controller.complete(badPayload);
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedException);
        assert.match(err.message, /SETUP_TOKEN/);
        return true;
      },
    );
  });

  test('3. Setup works once with valid token, saves settings and logs audit', async () => {
    const { service, auditLogs } = createMockInstitutionService();
    const controller = new SetupController(service);

    const res = await controller.complete(validSetupPayload);
    assert.strictEqual(res.success, true);
    assert.strictEqual(auditLogs.length, 1);
    assert.strictEqual(auditLogs[0][1], 'CREATE');
    assert.strictEqual(auditLogs[0][2], 'institution_setup');
  });

  test('4. Second call to POST /setup/complete is rejected with NotFoundException (404)', async () => {
    const { service } = createMockInstitutionService();
    const controller = new SetupController(service);

    // Первый вызов успешен
    await controller.complete(validSetupPayload);

    // Второй вызов навсегда возвращает 404
    await assert.rejects(
      async () => {
        await controller.complete(validSetupPayload);
      },
      (err) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );

    // GET /setup/status также навсегда возвращает 404
    await assert.rejects(
      async () => {
        await controller.getStatus();
      },
      (err) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test('5. Concurrent setup calls produce only ONE success (race condition check)', async () => {
    const { service } = createMockInstitutionService();

    // Запускаем 10 параллельных запросов одновременно
    const promises = Array.from({ length: 10 }).map(() =>
      service.completeSetup(validSetupPayload),
    );

    const results = await Promise.allSettled(promises);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1, 'Ровно 1 вызов должен завершиться успехом');
    assert.strictEqual(rejected.length, 9, 'Все остальные 9 вызовов должны быть отклонены');

    // Все отклоненные вызовы должны вернуть NotFoundException (404)
    for (const r of rejected) {
      assert.ok(r.reason instanceof NotFoundException);
    }
  });

  test('6. Public endpoint (GET /public/institution) NEVER returns private fields', async () => {
    const { service } = createMockInstitutionService();
    const setupCtrl = new SetupController(service);
    const publicCtrl = new PublicInstitutionController(service);

    // Завершаем настройку с приватными полями
    await setupCtrl.complete(validSetupPayload);

    const res = await publicCtrl.getPublicSettings();
    assert.strictEqual(res.success, true);
    assert.ok(res.data);

    const pub = res.data;

    // Публичные поля присутствуют
    assert.strictEqual(pub.nameUz, 'Fargʻona 2-son texnikumi');
    assert.strictEqual(pub.mainPhone, '+998 (73) 244-00-00');
    assert.strictEqual(pub.brandPrimaryColor, '#1e3a8a');
    assert.strictEqual(pub.stirInn, '302987654');

    // Приватные поля строго отсутствуют (undefined)
    assert.strictEqual(pub.bankName, undefined, 'bankName не должен отдаваться публично');
    assert.strictEqual(pub.bankAccount, undefined, 'bankAccount не должен отдаваться публично');
    assert.strictEqual(pub.mfoCode, undefined, 'mfoCode не должен отдаваться публично');
    assert.strictEqual(pub.jshshirPinfl, undefined, 'jshshirPinfl не должен отдаваться публично');
    assert.strictEqual(pub.treasuryAccount, undefined, 'treasuryAccount не должен отдаваться публично');
    assert.strictEqual(pub.okedCode, undefined, 'okedCode не должен отдаваться публично');
    assert.strictEqual(pub.directorNameUz, undefined, 'directorNameUz не должен отдаваться публично');
    assert.strictEqual(pub.directorPhone, undefined, 'directorPhone не должен отдаваться публично');
    assert.strictEqual(pub.privateSettings, undefined, 'privateSettings объект не должен присутствовать');
  });

  test('7. RolesGuard blocks non-admin users from reading or changing admin institution settings', () => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);

    const createMockContext = (role) => ({
      getHandler: () => AdminInstitutionController.prototype.getSettings,
      getClass: () => AdminInstitutionController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'u-1',
            email: 'user@texnikum2.uz',
            fullName: 'User Test',
            role,
          },
        }),
      }),
    });

    // 1. Администратор допускается
    const adminCtx = createMockContext(UserRole.ADMIN);
    assert.strictEqual(guard.canActivate(adminCtx), true);

    // 2. Редактор (EDITOR) блокируется
    const editorCtx = createMockContext(UserRole.EDITOR);
    assert.throws(
      () => guard.canActivate(editorCtx),
      (err) => err instanceof ForbiddenException,
    );

    // 3. Модератор (MODERATOR) блокируется
    const modCtx = createMockContext(UserRole.MODERATOR);
    assert.throws(
      () => guard.canActivate(modCtx),
      (err) => err instanceof ForbiddenException,
    );
  });

  test('8. Admin can read full settings and update them with audit trail', async () => {
    const { service, auditLogs } = createMockInstitutionService();
    const setupCtrl = new SetupController(service);
    const adminCtrl = new AdminInstitutionController(service);

    await setupCtrl.complete(validSetupPayload);

    const adminUser = {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@texnikum2.uz',
      fullName: 'Super Admin',
      role: UserRole.ADMIN,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    // Чтение полных настроек
    const fullRes = await adminCtrl.getSettings();
    assert.strictEqual(fullRes.success, true);
    assert.ok(fullRes.data.privateSettings);
    assert.strictEqual(fullRes.data.privateSettings.bankName, 'Oʻzmilliybank Fargʻona filiali');

    // Обновление настроек
    const updateDto = {
      shortNameUz: 'Yangilangan 2-son texnikum',
      bankName: 'Aloqabank Fargʻona BXM',
    };

    const updateRes = await adminCtrl.updateSettings(updateDto, adminUser);
    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.data.shortNameUz, 'Yangilangan 2-son texnikum');
    assert.strictEqual(updateRes.data.privateSettings.bankName, 'Aloqabank Fargʻona BXM');

    // Проверяем запись в аудит
    const lastAudit = auditLogs[auditLogs.length - 1];
    assert.strictEqual(lastAudit[0], adminUser.id);
    assert.strictEqual(lastAudit[1], 'UPDATE');
    assert.strictEqual(lastAudit[2], 'institution_settings');
  });

  test('9. DTO validation rejects invalid phone, email, weak password and invalid hex color', async () => {
    // Неверный телефон (+7 вместо +998), слабый пароль (без спецсимвола и цифры), неверный HEX
    const badDto = plainToInstance(CompleteSetupDto, {
      ...validSetupPayload,
      mainPhone: '89991234567', // не +998
      adminEmail: 'not-an-email',
      adminPassword: 'weak', // нет спецсимвола, цифры, менее 8 знаков
      brandPrimaryColor: 'red', // не #HEX
      stirInn: '123', // не 9 знаков
    });

    const errors = await validate(badDto);
    assert.ok(errors.length > 0);

    const errorProps = errors.map((e) => e.property);
    assert.ok(errorProps.includes('mainPhone'), 'mainPhone должен быть отклонён');
    assert.ok(errorProps.includes('adminEmail'), 'adminEmail должен быть отклонён');
    assert.ok(errorProps.includes('adminPassword'), 'adminPassword должен быть отклонён');
    assert.ok(errorProps.includes('brandPrimaryColor'), 'brandPrimaryColor должен быть отклонён');
    assert.ok(errorProps.includes('stirInn'), 'stirInn должен быть отклонён');
  });
});
