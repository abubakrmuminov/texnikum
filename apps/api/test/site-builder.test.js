const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} = require('@nestjs/common');
const { Reflector } = require('@nestjs/core');
const { UserRole, validatePageBlocks } = require('@college/shared');

const { NavigationService } = require('../dist/modules/navigation/navigation.service');
const { AdminNavigationController } = require('../dist/modules/navigation/admin-navigation.controller');
const { NavigationController } = require('../dist/modules/navigation/navigation.controller');

const { PagesService } = require('../dist/modules/pages/pages.service');
const { AdminPagesController, PagesController } = require('../dist/modules/pages/pages.controller');

const { ThemeService } = require('../dist/modules/theme/theme.service');
const { AdminThemeController, ThemeController } = require('../dist/modules/theme/theme.controller');

const { RolesGuard } = require('../dist/modules/auth/guards/roles.guard');
const { sanitizeHtmlContent, sanitizeBlockConfig } = require('../dist/common/utils/sanitizer.util');

// Вспомогательные фикстуры
function createMockEnvironment() {
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
    delByPattern: async () => cache.clear(),
  };

  const supabaseService = {
    isReady: () => false,
    getClient: () => null,
  };

  const navigationService = new NavigationService(supabaseService, auditService, cacheService);
  const adminNavController = new AdminNavigationController(navigationService);
  const publicNavController = new NavigationController(navigationService);

  const pagesService = new PagesService(supabaseService, auditService, cacheService);
  const adminPagesController = new AdminPagesController(pagesService);
  const publicPagesController = new PagesController(pagesService);

  const themeService = new ThemeService(supabaseService, auditService, cacheService);
  const adminThemeController = new AdminThemeController(themeService);
  const publicThemeController = new ThemeController(themeService);

  const adminUser = {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'admin@texnikum.uz',
    fullName: 'Boshqaruvchi Administrator',
    role: UserRole.ADMIN,
  };

  const editorUser = {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'editor@texnikum.uz',
    fullName: 'Sayt Muharriri',
    role: UserRole.EDITOR,
  };

  const moderatorUser = {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'moderator@texnikum.uz',
    fullName: 'Nazoratchi Moderator',
    role: UserRole.MODERATOR,
  };

  return {
    navigationService,
    adminNavController,
    publicNavController,
    pagesService,
    adminPagesController,
    publicPagesController,
    themeService,
    adminThemeController,
    publicThemeController,
    adminUser,
    editorUser,
    moderatorUser,
    auditLogs,
    cache,
  };
}

describe('Site Builder Backend & API Tests (Phase S1)', () => {
  test('1. System and mandatory pages cannot be deleted', async () => {
    const { pagesService, adminUser } = createMockEnvironment();

    // info-common - обязательный системный раздел ст. 37 ЗРУ-637
    await assert.rejects(
      async () => {
        await pagesService.delete('40000000-0000-0000-0000-000000000001', {}, adminUser);
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('не подлежат удалению'));
        return true;
      },
    );
  });

  test('2. Mandatory item requires confirm flag and admin role to hide or delete', async () => {
    const { navigationService, pagesService, adminUser, editorUser } = createMockEnvironment();

    const mandatoryNavId = '00000000-0000-0000-0001-000000000002'; // Texnikum haqida
    const mandatoryPageId = '40000000-0000-0000-0000-000000000001'; // Asosiy maʼlumotlar

    // 2.1 Попытка скрыть без confirm=true отклоняется
    await assert.rejects(
      async () => {
        await navigationService.update(mandatoryNavId, { isVisible: false }, adminUser);
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('confirm=true'));
        return true;
      },
    );

    // 2.2 Сокрытие с confirm=true разрешено администратору
    const navResult = await navigationService.update(
      mandatoryNavId,
      { isVisible: false, confirm: true },
      adminUser,
    );
    assert.equal(navResult.success, true);
    assert.equal(navResult.data.isVisible, false);

    // 2.3 Попытка снять обязательную страницу с публикации без confirm=true отклоняется
    await assert.rejects(
      async () => {
        await pagesService.update(mandatoryPageId, { isPublished: false }, adminUser);
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('confirm=true'));
        return true;
      },
    );

    // 2.4 Редактор не имеет права изменять структуру меню
    await assert.rejects(
      async () => {
        await navigationService.update(mandatoryNavId, { isVisible: true }, editorUser);
      },
      (err) => {
        assert(err instanceof ForbiddenException);
        return true;
      },
    );
  });

  test('3. Restore defaults restores factory system navigation tree', async () => {
    const { navigationService, adminUser } = createMockEnvironment();

    // Создаем пользовательский пункт меню
    await navigationService.create(
      {
        labelUz: 'Kafedralar',
        labelRu: 'Кафедры',
        path: '/departments',
        location: 'header',
      },
      adminUser,
    );

    // Восстанавливаем заводские настройки
    const res = await navigationService.restoreDefaults(adminUser);
    assert.equal(res.success, true);
    assert.equal(res.data.restored, true);

    const tree = await navigationService.getPublicNavigation();
    assert.equal(tree.success, true);
    // Проверяем, что корень содержит главную страницу и раздел техникума
    assert(tree.data.some((item) => item.path === '/'));
    assert(tree.data.some((item) => item.path === '/info'));
  });

  test('4. Reserved slugs and duplicate slugs are rejected', async () => {
    const { pagesService, adminUser } = createMockEnvironment();

    // 4.1 Зарезервированный slug 'admin'
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Admin panel',
            slug: 'admin',
            section: 'general',
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('зарезервирован системой'));
        return true;
      },
    );

    // 4.2 Зарезервированный slug 'news'
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Yangiliklar',
            slug: 'news',
            section: 'general',
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('зарезервирован'));
        return true;
      },
    );

    // 4.3 Успешное создание уникальной страницы
    const created = await pagesService.create(
      {
        title: 'Bizning hamkorlar',
        slug: 'bizning-hamkorlar',
        section: 'general',
      },
      adminUser,
    );
    assert.equal(created.success, true);

    // 4.4 Повторная попытка создания с тем же слагом отклоняется
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Yana bir hamkorlar',
            slug: 'bizning-hamkorlar',
            section: 'general',
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('уже существует'));
        return true;
      },
    );
  });

  test('5. Menu nesting deeper than 1 child level is strictly rejected', async () => {
    const { navigationService, adminUser } = createMockEnvironment();

    // info-common уже является дочерним элементом раздела Texnikum haqida (1 уровень)
    const childItemParentId = '00000000-0000-0000-0001-000000000011';

    // Попытка привязать новый пункт к дочернему пункту (попытка создать 2-й уровень вложенности)
    await assert.rejects(
      async () => {
        await navigationService.create(
          {
            labelUz: 'Ichki nizom',
            labelRu: 'Внутренний регламент',
            path: '/info/inner-policy',
            parentId: childItemParentId,
            location: 'header',
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('Вложенность меню строго ограничена 1 уровнем'));
        return true;
      },
    );
  });

  test('6. Invalid or unknown blocks and missing alt-text are rejected', async () => {
    // 6.1 Неизвестный тип блока
    const unknownBlockRes = validatePageBlocks([
      {
        id: 'b-1',
        type: 'unsupported_3d_viewer',
        sortOrder: 1,
        isVisible: true,
        config: {},
      },
    ]);
    assert.equal(unknownBlockRes.valid, false);
    assert(unknownBlockRes.error.includes('Недопустимый тип блока'));

    // 6.2 Блок image без alt-текста и не помеченный как декоративный
    const imageWithoutAltRes = validatePageBlocks([
      {
        id: 'b-2',
        type: 'image',
        sortOrder: 1,
        isVisible: true,
        config: {
          url: 'https://example.com/photo.jpg',
          isDecorative: false,
          altTextUz: '',
          altTextRu: '',
        },
      },
    ]);
    assert.equal(imageWithoutAltRes.valid, false);
    assert(imageWithoutAltRes.error.includes('обязателен alt-текст'));

    // 6.3 Декоративное изображение без alt-текста допустимо (WCAG 2.1 AA)
    const decorativeImageRes = validatePageBlocks([
      {
        id: 'b-3',
        type: 'image',
        sortOrder: 1,
        isVisible: true,
        config: {
          url: 'https://example.com/pattern.png',
          isDecorative: true,
        },
      },
    ]);
    assert.equal(decorativeImageRes.valid, true);
  });

  test('7. Script and HTML injection attempts in rich text are sanitized', async () => {
    const dirtyHtml =
      '<h3>Заголовок</h3><script>alert("XSS")</script><p onclick="stealCookies()">Текст с инъекцией</p><iframe src="https://evil.com/leak"></iframe>';

    const cleanHtml = sanitizeHtmlContent(dirtyHtml);

    // Скрипты и события удалены
    assert(!cleanHtml.includes('<script>'));
    assert(!cleanHtml.includes('alert('));
    assert(!cleanHtml.includes('onclick'));
    assert(!cleanHtml.includes('stealCookies'));
    // Небезопасный iframe заменен/удален
    assert(!cleanHtml.includes('evil.com'));
    // Безопасный HTML сохранен
    assert(cleanHtml.includes('<h3>Заголовок</h3>'));
    assert(cleanHtml.includes('Текст с инъекцией'));
  });

  test('8. Video embeds outside the allowlist are rejected', async () => {
    // 8.1 Видео с вредоносного хостинга отклоняется
    const badVideoRes = validatePageBlocks([
      {
        id: 'b-video-1',
        type: 'video_embed',
        sortOrder: 1,
        isVisible: true,
        config: {
          url: 'https://unsafe-videos.xyz/embed/12345',
        },
      },
    ]);
    assert.equal(badVideoRes.valid, false);
    assert(badVideoRes.error.includes('Разрешены только доверенные хостинги'));

    // 8.2 Видео с YouTube принимается
    const goodYouTubeRes = validatePageBlocks([
      {
        id: 'b-video-2',
        type: 'video_embed',
        sortOrder: 1,
        isVisible: true,
        config: {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      },
    ]);
    assert.equal(goodYouTubeRes.valid, true);
  });

  test('9. Unpublished pages and hidden items are not public', async () => {
    const { pagesService, navigationService, adminUser } = createMockEnvironment();

    // 9.1 Создаем черновик страницы
    const draft = await pagesService.create(
      {
        title: 'Loyiha qoralamasi',
        slug: 'loyiha-qoralamasi',
        section: 'general',
        isPublished: false,
      },
      adminUser,
    );

    // Публичный запрос страницы возвращает NotFoundException (404)
    await assert.rejects(
      async () => {
        await pagesService.findOne(draft.data.slug);
      },
      (err) => {
        assert(err instanceof NotFoundException);
        return true;
      },
    );

    // 9.2 Создаем скрытый пункт навигации
    await navigationService.create(
      {
        labelUz: 'Yashirin menyu',
        labelRu: 'Скрытое меню',
        path: '/hidden',
        isVisible: false,
        location: 'header',
      },
      adminUser,
    );

    const publicNav = await navigationService.getPublicNavigation();
    assert(!publicNav.data.some((item) => item.path === '/hidden'));
  });

  test('10. Page revisions are pruned past 20 and can be restored', async () => {
    const { pagesService, adminUser } = createMockEnvironment();

    const created = await pagesService.create(
      {
        title: 'Versiyalar sahifasi',
        slug: 'versiyalar-sahifasi',
        section: 'general',
        contentHtml: '<p>Boshlangʻich matn</p>',
      },
      adminUser,
    );

    const pageId = created.data.id;

    // Вносим 25 обновлений
    for (let i = 1; i <= 25; i++) {
      await pagesService.update(
        pageId,
        {
          contentHtml: `<p>Yangilanish #${i}</p>`,
          changeSummary: `Oʻzgarish #${i}`,
        },
        adminUser,
      );
    }

    const revList = await pagesService.listRevisions(pageId);
    assert.equal(revList.success, true);
    // Лимит строго 20 ревизий!
    assert.equal(revList.data.length, 20);

    // Восстанавливаем самую старую доступную ревизию из списка
    const oldestRev = revList.data[revList.data.length - 1];
    const restored = await pagesService.restoreRevision(pageId, oldestRev.id, adminUser);
    assert.equal(restored.success, true);
    assert.equal(restored.data.contentHtml, oldestRev.snapshot.contentHtml);
  });

  test('11. Editor cannot change structure or theme', async () => {
    const { navigationService, themeService, editorUser } = createMockEnvironment();

    // Попытка редактора создать пункт меню
    await assert.rejects(
      async () => {
        await navigationService.create(
          {
            labelUz: 'Ruxsatsiz havola',
            labelRu: 'Запрещенная ссылка',
            path: '/forbidden',
          },
          editorUser,
        );
      },
      (err) => {
        assert(err instanceof ForbiddenException);
        assert(err.message.includes('Только администратор'));
        return true;
      },
    );

    // Попытка редактора изменить тему оформления
    await assert.rejects(
      async () => {
        await themeService.selectPreset(
          {
            preset: 'emerald_oasis',
          },
          editorUser,
        );
      },
      (err) => {
        assert(err instanceof ForbiddenException);
        assert(err.message.includes('Только администратор'));
        return true;
      },
    );

    // Проверка RolesGuard через рефлектор
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);

    const mockAdminContext = {
      getHandler: () => AdminNavigationController.prototype.create,
      getClass: () => AdminNavigationController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.EDITOR } }),
      }),
    };

    assert.throws(
      () => {
        guard.canActivate(mockAdminContext);
      },
      (err) => {
        assert(err instanceof ForbiddenException);
        return true;
      },
    );
  });

  test('12. Visual Grid: valid 12-column layout (e.g. 6+6, 4+4+4) is validated and stored', async () => {
    const { pagesService, adminUser } = createMockEnvironment();
    const created = await pagesService.create(
      {
        title: 'Grid sahifa',
        slug: 'grid-sahifa',
        section: 'general',
        schemaVersion: 2,
        rows: [
          {
            id: 'row-1',
            style: {
              backgroundStyle: 'subtle',
              paddingVertical: 'normal',
              containerWidth: 'wide',
            },
            cells: [
              {
                id: 'cell-1',
                colSpan: 6,
                blocks: [
                  {
                    id: 'b-1',
                    type: 'heading',
                    sortOrder: 0,
                    isVisible: true,
                    config: { level: 2, textUz: 'Chap ustun', textRu: 'Левая колонка' },
                  },
                ],
              },
              {
                id: 'cell-2',
                colSpan: 6,
                blocks: [
                  {
                    id: 'b-2',
                    type: 'rich_text',
                    sortOrder: 0,
                    isVisible: true,
                    config: { contentUzHtml: '<p>Oʻng ustun</p>', contentRuHtml: '<p>Правая колонка</p>' },
                  },
                ],
              },
            ],
          },
        ],
      },
      adminUser,
    );

    assert.equal(created.success, true);
    assert.equal(created.data.schemaVersion, 2);
    assert.equal(created.data.rows?.length, 1);
    assert.equal(created.data.rows?.[0]?.cells.length, 2);
    assert.equal(created.data.rows?.[0]?.cells[0]?.colSpan, 6);
    assert.equal(created.data.rows?.[0]?.cells[1]?.colSpan, 6);
  });

  test('13. Visual Grid: invalid layout (colSpan < 3, sum > 12, > 4 cells) is strictly rejected', async () => {
    const { pagesService, adminUser } = createMockEnvironment();
    // 13.1 colSpan < 3 (min is 3)
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Invalid Span',
            slug: 'invalid-span',
            section: 'general',
            rows: [
              {
                id: 'row-err-1',
                cells: [
                  {
                    id: 'cell-err-1',
                    colSpan: 2, // invalid: minimum is 3
                    blocks: [],
                  },
                ],
              },
            ],
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('colSpan') || err.message.includes('допустимо от 3 до 12'));
        return true;
      },
    );

    // 13.2 Sum of colSpans > 12 (e.g. 8 + 6 = 14)
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Invalid Sum',
            slug: 'invalid-sum',
            section: 'general',
            rows: [
              {
                id: 'row-err-2',
                cells: [
                  { id: 'c1', colSpan: 8, blocks: [] },
                  { id: 'c2', colSpan: 6, blocks: [] },
                ],
              },
            ],
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('превышает допустимый максимум 12'));
        return true;
      },
    );

    // 13.3 More than 4 cells per row
    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Too Many Cells',
            slug: 'too-many-cells',
            section: 'general',
            rows: [
              {
                id: 'row-err-3',
                cells: [
                  { id: 'c1', colSpan: 3, blocks: [] },
                  { id: 'c2', colSpan: 3, blocks: [] },
                  { id: 'c3', colSpan: 3, blocks: [] },
                  { id: 'c4', colSpan: 3, blocks: [] },
                  { id: 'c5', colSpan: 3, blocks: [] }, // 5 cells!
                ],
              },
            ],
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('максимум допустимо 4 ячейки'));
        return true;
      },
    );
  });

  test('14. Visual Grid: container nesting deeper than 2 levels is strictly rejected', async () => {
    const { pagesService, adminUser } = createMockEnvironment();
    const deeplyNestedRows = [
      {
        id: 'row-deep-0',
        cells: [
          {
            id: 'c-deep-0',
            colSpan: 12,
            blocks: [
              {
                id: 'b-container-1',
                type: 'accordion',
                sortOrder: 0,
                isVisible: true,
                config: { items: [] },
                nestedRows: [
                  {
                    id: 'row-deep-1',
                    cells: [
                      {
                        id: 'c-deep-1',
                        colSpan: 12,
                        blocks: [
                          {
                            id: 'b-container-2',
                            type: 'accordion',
                            sortOrder: 0,
                            isVisible: true,
                            config: { items: [] },
                            nestedRows: [
                              {
                                id: 'row-deep-2',
                                cells: [
                                  {
                                    id: 'c-deep-2',
                                    colSpan: 12,
                                    blocks: [
                                      {
                                        id: 'b-container-3',
                                        type: 'accordion',
                                        sortOrder: 0,
                                        isVisible: true,
                                        config: { items: [] },
                                        nestedRows: [
                                          {
                                            id: 'row-deep-3-too-deep',
                                            cells: [{ id: 'c-too-deep', colSpan: 12, blocks: [] }],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    await assert.rejects(
      async () => {
        await pagesService.create(
          {
            title: 'Too Deep',
            slug: 'too-deep',
            section: 'general',
            rows: deeplyNestedRows,
          },
          adminUser,
        );
      },
      (err) => {
        assert(err instanceof BadRequestException);
        assert(err.message.includes('глубина вложенности'));
        return true;
      },
    );
  });

  test('15. Backward compatibility: legacy flat blocks auto-migrate with zero data loss', async () => {
    const { pagesService, adminUser } = createMockEnvironment();
    const legacyPage = await pagesService.create(
      {
        title: 'Legacy sahifa',
        slug: 'legacy-sahifa',
        section: 'general',
        blocks: [
          {
            id: 'legacy-b1',
            type: 'heading',
            sortOrder: 0,
            isVisible: true,
            config: { level: 1, textUz: 'Eski sarlavha', textRu: 'Старый заголовок' },
          },
          {
            id: 'legacy-b2',
            type: 'rich_text',
            sortOrder: 1,
            isVisible: true,
            config: { contentUzHtml: '<p>Eski matn</p>', contentRuHtml: '<p>Старый текст</p>' },
          },
        ],
      },
      adminUser,
    );

    assert.equal(legacyPage.success, true);
    assert.equal(legacyPage.data.schemaVersion, 2);
    assert.equal(legacyPage.data.rows?.length, 2);
    assert.equal(legacyPage.data.rows?.[0]?.cells[0]?.colSpan, 12);
    assert.equal(legacyPage.data.rows?.[0]?.cells[0]?.blocks[0]?.id, 'legacy-b1');
    assert.equal(legacyPage.data.rows?.[1]?.cells[0]?.blocks[0]?.id, 'legacy-b2');

    // Public lookup returns normalized rows
    const pub = await pagesService.findOne('legacy-sahifa', 'uz');
    assert.equal(pub.data.rows?.length, 2);
  });

  test('16. Reusable blocks: save section as reusable, list, and update', async () => {
    const { pagesService, adminUser, editorUser } = createMockEnvironment();

    // 16.1 Editor can save a row as a reusable block
    const created = await pagesService.createReusableBlock(
      {
        titleUz: 'Kutubxona eʼlonlar paneli',
        titleRu: 'Панель объявлений библиотеки',
        category: 'banner',
        isGlobal: false,
        rowData: {
          id: 'row-library-banner',
          style: { backgroundStyle: 'subtle', paddingVertical: 'normal', containerWidth: 'standard' },
          cells: [
            {
              id: 'cell-lib-1',
              colSpan: 12,
              blocks: [
                {
                  id: 'blk-lib-1',
                  type: 'banner_alert',
                  sortOrder: 0,
                  isVisible: true,
                  config: {
                    variant: 'info',
                    titleUz: 'Elektron kutubxona fondi',
                    titleRu: 'Фонд электронной библиотеки',
                  },
                },
              ],
            },
          ],
        },
      },
      editorUser,
    );

    assert.equal(created.success, true);
    assert.equal(created.data.titleUz, 'Kutubxona eʼlonlar paneli');
    assert.equal(created.data.isGlobal, false);

    // 16.2 List all reusable blocks includes the created block
    const all = await pagesService.getAllReusableBlocks();
    assert.equal(all.success, true);
    const found = all.data.find((b) => b.id === created.data.id);
    assert.ok(found);
    assert.equal(found?.usageCount, 0);

    // 16.3 Update reusable block
    const updated = await pagesService.updateReusableBlock(
      created.data.id,
      {
        titleUz: 'Yangilangan kutubxona paneli',
      },
      adminUser,
    );
    assert.equal(updated.data.titleUz, 'Yangilangan kutubxona paneli');
  });

  test('17. Global blocks: page usage tracking and delete with usage count', async () => {
    const { pagesService, adminUser } = createMockEnvironment();

    // 17.1 Create a global block
    const globalBlock = await pagesService.createReusableBlock(
      {
        titleUz: 'Umumiy eʼlonlar paneli',
        titleRu: 'Общая панель объявлений',
        category: 'footer',
        isGlobal: true,
        rowData: {
          id: 'row-global-banner',
          style: { backgroundStyle: 'brand', paddingVertical: 'compact', containerWidth: 'standard' },
          cells: [
            {
              id: 'cell-gb-1',
              colSpan: 12,
              blocks: [
                {
                  id: 'blk-gb-1',
                  type: 'banner_alert',
                  sortOrder: 0,
                  isVisible: true,
                  config: { variant: 'info', titleUz: 'Eʼlon', titleRu: 'Объявление' },
                },
              ],
            },
          ],
        },
      },
      adminUser,
    );

    const blockId = globalBlock.data.id;

    // 17.2 Create a page referencing this global block
    await pagesService.create(
      {
        title: 'Sahifa 1',
        slug: 'sahifa-bir',
        section: 'general',
        schemaVersion: 2,
        rows: [
          {
            id: 'row-p1-ref',
            style: { backgroundStyle: 'none', paddingVertical: 'normal', containerWidth: 'standard' },
            cells: [
              {
                id: 'cell-p1-ref',
                colSpan: 12,
                blocks: [
                  {
                    id: 'blk-ref-1',
                    type: 'reusable_ref',
                    sortOrder: 0,
                    isVisible: true,
                    config: { reusableBlockId: blockId, blockTitle: 'Umumiy panel' },
                  },
                ],
              },
            ],
          },
        ],
      },
      adminUser,
    );

    // 17.3 Usage count is now 1
    const usage = pagesService.countReusableBlockUsage(blockId);
    assert.equal(usage, 1);

    // 17.4 Deleting the block returns the usageCount
    const delRes = await pagesService.deleteReusableBlock(blockId, adminUser);
    assert.equal(delRes.success, true);
    assert.equal(delRes.data.deleted, true);
    assert.equal(delRes.data.usageCount, 1);
  });
});
