import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  ApiResponse,
  InstitutionFullSettings,
  InstitutionPrivateSettings,
  InstitutionPublicSettings,
  SetupStatusResponse,
  UserProfile,
  UserRole,
} from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CompleteSetupDto } from './dto/complete-setup.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      // Предотвращаем side-channel атаку по длине
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

@Injectable()
export class InstitutionService {
  private readonly logger = new Logger(InstitutionService.name);

  // Флаг первичной настройки
  private isConfigured = false;
  private setupLock = false;

  // Хранилище настроек (синглтон)
  private publicSettings: InstitutionPublicSettings = {
    id: 1,
    nameUz: '',
    nameRu: '',
    shortNameUz: '',
    shortNameRu: '',
    institutionType: 'texnikum',
    legalAddressUz: '',
    legalAddressRu: '',
    mainPhone: '',
    admissionPhone: '',
    trustPhone: '',
    contactEmail: '',
    admissionEmail: '',
    websiteDomain: '',
    geoLatitude: 40.3864,
    geoLongitude: 71.7864,
    logoUrl: null,
    faviconUrl: null,
    coatOfArmsUrl: null,
    brandPrimaryColor: '#1e3a8a',
    socialTelegram: null,
    socialInstagram: null,
    socialFacebook: null,
    socialYoutube: null,
    stirInn: '',
    workHoursUz: 'Dushanba – Shanba: 08:30 – 17:30',
    workHoursRu: 'Понедельник – Суббота: 08:30 – 17:30',
    isConfigured: false,
    setupCompletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  private privateSettings: InstitutionPrivateSettings = {
    id: 1,
    bankName: null,
    bankAccount: null,
    mfoCode: null,
    jshshirPinfl: null,
    treasuryAccount: null,
    okedCode: null,
    directorNameUz: null,
    directorNameRu: null,
    directorPhone: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {
    this.initFromDatabase();
  }

  /**
   * Синхронизация состояния с базой данных при старте
   */
  private async initFromDatabase(): Promise<void> {
    if (!this.supabaseService.isReady()) {
      return;
    }

    try {
      const supabase = this.supabaseService.getClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        this.isConfigured = Boolean(data.is_configured);
        this.publicSettings = this.mapPublicRowToDto(data);
      }
    } catch (err) {
      this.logger.warn(`Не удалось прочитать institution_settings из БД: ${(err as Error).message}`);
    }
  }

  /**
   * Проверка статуса настройки (GET /setup/status)
   * После завершения настройки эндпоинт навсегда возвращает 404
   */
  async getSetupStatus(): Promise<SetupStatusResponse> {
    if (this.isConfigured) {
      throw new NotFoundException('Oʻrnatish xizmati mavjud emas / Сервис первичной настройки недоступен');
    }
    return { configured: false };
  }

  /**
   * Получение публичных настроек (GET /public/institution)
   * Доступно всем, кэшируемо, никогда не содержит приватные поля
   */
  async getPublicSettings(): Promise<ApiResponse<InstitutionPublicSettings>> {
    // Попытка взять из кэша
    const cached = await this.cacheService.get<InstitutionPublicSettings>('institution:public');
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('institution_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (!error && data) {
          const mapped = this.mapPublicRowToDto(data);
          this.publicSettings = mapped;
          this.isConfigured = mapped.isConfigured;
          await this.cacheService.set('institution:public', mapped, 300);
          return {
            success: true,
            data: mapped,
            timestamp: new Date().toISOString(),
          };
        }
      }
    }

    return {
      success: true,
      data: this.publicSettings,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Проверка токена установки (POST /setup/verify-token)
   * Позволяет проверить токен на 0-м шаге мастера настройки
   */
  async verifySetupToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    if (this.isConfigured) {
      throw new NotFoundException('Oʻrnatish allaqachon yakunlangan / Первичная настройка уже завершена');
    }

    const expectedToken =
      this.configService.get<string>('SETUP_TOKEN') ||
      process.env.SETUP_TOKEN ||
      '';

    if (!expectedToken || !constantTimeCompare(token || '', expectedToken)) {
      throw new UnauthorizedException(
        'Notoʻgʻri yoki yaroqsiz oʻrnatish kodi (SETUP_TOKEN) / Неверный или недействительный токен установки',
      );
    }

    return {
      success: true,
      data: { valid: true },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Завершение первичной настройки (POST /setup/complete)
   * Работает ТОЛЬКО пока is_configured = false.
   * Атомарная операция: проверка токена в константном времени,
   * создание суперадмина, сохранение реквизитов, опечатывание /setup навсегда (404).
   */
  async completeSetup(dto: CompleteSetupDto): Promise<ApiResponse<{ message: string }>> {
    // 1. Если система уже настроена или заблокирована параллельным процессом
    if (this.isConfigured || this.setupLock) {
      throw new NotFoundException('Oʻrnatish allaqachon yakunlangan / Первичная настройка уже завершена');
    }

    // 2. Проверка токена установки в константном времени
    const expectedToken =
      this.configService.get<string>('SETUP_TOKEN') ||
      process.env.SETUP_TOKEN ||
      '';

    if (!expectedToken || !constantTimeCompare(dto.setupToken, expectedToken)) {
      throw new UnauthorizedException(
        'Notoʻgʻri yoki yaroqsiz oʻrnatish kodi (SETUP_TOKEN) / Неверный или недействительный токен установки',
      );
    }

    // Захватываем блокировку
    this.setupLock = true;

    try {
      const nowIso = new Date().toISOString();

      // 3. Если подключен Supabase — выполняем атомарный условный UPDATE в БД
      if (this.supabaseService.isReady()) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
          // Условное обновление: только если is_configured = false
          const { data: updatedRows, error: updateError } = await supabase
            .from('institution_settings')
            .update({
              name_uz: dto.nameUz,
              name_ru: dto.nameRu,
              short_name_uz: dto.shortNameUz,
              short_name_ru: dto.shortNameRu,
              institution_type: dto.institutionType,
              legal_address_uz: dto.legalAddressUz,
              legal_address_ru: dto.legalAddressRu,
              main_phone: dto.mainPhone,
              admission_phone: dto.admissionPhone || '',
              trust_phone: dto.trustPhone || '',
              contact_email: dto.contactEmail,
              admission_email: dto.admissionEmail || '',
              website_domain: dto.websiteDomain || '',
              geo_latitude: dto.geoLatitude,
              geo_longitude: dto.geoLongitude,
              logo_url: dto.logoUrl || null,
              favicon_url: dto.faviconUrl || null,
              coat_of_arms_url: dto.coatOfArmsUrl || null,
              brand_primary_color: dto.brandPrimaryColor,
              social_telegram: dto.socialTelegram || null,
              social_instagram: dto.socialInstagram || null,
              social_facebook: dto.socialFacebook || null,
              social_youtube: dto.socialYoutube || null,
              stir_inn: dto.stirInn,
              work_hours_uz: dto.workHoursUz || 'Dushanba – Shanba: 08:30 – 17:30',
              work_hours_ru: dto.workHoursRu || 'Понедельник – Суббота: 08:30 – 17:30',
              is_configured: true,
              setup_completed_at: nowIso,
              updated_at: nowIso,
            })
            .eq('id', 1)
            .eq('is_configured', false)
            .select();

          if (updateError) {
            this.logger.error(`Database error during completeSetup: ${updateError.message} (code: ${updateError.code})`);
            throw new InternalServerErrorException(
              `Maʼlumotlar bazasida xatolik yuz berdi / Ошибка базы данных при сохранении настроек: ${updateError.message}`,
            );
          }

          if (!updatedRows || updatedRows.length === 0) {
            throw new NotFoundException(
              'Oʻrnatish allaqachon yakunlangan / Первичная настройка уже завершена',
            );
          }

          // Обновляем приватные настройки
          await supabase
            .from('institution_private')
            .upsert({
              id: 1,
              bank_name: dto.bankName || null,
              bank_account: dto.bankAccount || null,
              mfo_code: dto.mfoCode || null,
              jshshir_pinfl: dto.jshshirPinfl || null,
              treasury_account: dto.treasuryAccount || null,
              oked_code: dto.okedCode || null,
              director_name_uz: dto.directorNameUz || null,
              director_name_ru: dto.directorNameRu || null,
              director_phone: dto.directorPhone || null,
              updated_at: nowIso,
            });

          // Создаем администратора в Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: dto.adminEmail,
            password: dto.adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: dto.adminFullName,
              role: 'admin',
            },
          });

          if (!authError && authData.user) {
            // Назначаем роль admin в таблице profiles
            const { data: adminRole } = await supabase
              .from('roles')
              .select('id')
              .eq('name', 'admin')
              .single();

            if (adminRole) {
              await supabase
                .from('profiles')
                .upsert({
                  id: authData.user.id,
                  email: dto.adminEmail,
                  full_name: dto.adminFullName,
                  role_id: adminRole.id,
                  is_active: true,
                  updated_at: nowIso,
                });
            }
          }
        }
      }

      // 4. Обновляем память приложения
      this.publicSettings = {
        id: 1,
        nameUz: dto.nameUz,
        nameRu: dto.nameRu,
        shortNameUz: dto.shortNameUz,
        shortNameRu: dto.shortNameRu,
        institutionType: dto.institutionType,
        legalAddressUz: dto.legalAddressUz,
        legalAddressRu: dto.legalAddressRu,
        mainPhone: dto.mainPhone,
        admissionPhone: dto.admissionPhone || '',
        trustPhone: dto.trustPhone || '',
        contactEmail: dto.contactEmail,
        admissionEmail: dto.admissionEmail || '',
        websiteDomain: dto.websiteDomain || '',
        geoLatitude: dto.geoLatitude,
        geoLongitude: dto.geoLongitude,
        logoUrl: dto.logoUrl || null,
        faviconUrl: dto.faviconUrl || null,
        coatOfArmsUrl: dto.coatOfArmsUrl || null,
        brandPrimaryColor: dto.brandPrimaryColor,
        socialTelegram: dto.socialTelegram || null,
        socialInstagram: dto.socialInstagram || null,
        socialFacebook: dto.socialFacebook || null,
        socialYoutube: dto.socialYoutube || null,
        stirInn: dto.stirInn,
        workHoursUz: dto.workHoursUz || 'Dushanba – Shanba: 08:30 – 17:30',
        workHoursRu: dto.workHoursRu || 'Понедельник – Суббота: 08:30 – 17:30',
        isConfigured: true,
        setupCompletedAt: nowIso,
        createdAt: this.publicSettings.createdAt,
        updatedAt: nowIso,
      };

      this.privateSettings = {
        id: 1,
        bankName: dto.bankName || null,
        bankAccount: dto.bankAccount || null,
        mfoCode: dto.mfoCode || null,
        jshshirPinfl: dto.jshshirPinfl || null,
        treasuryAccount: dto.treasuryAccount || null,
        okedCode: dto.okedCode || null,
        directorNameUz: dto.directorNameUz || null,
        directorNameRu: dto.directorNameRu || null,
        directorPhone: dto.directorPhone || null,
        createdAt: this.privateSettings.createdAt,
        updatedAt: nowIso,
      };

      this.isConfigured = true;

      // Сбрасываем кэш
      await this.cacheService.del('institution:public');
      await this.cacheService.del('institution:admin');

      // Логируем установку в аудит
      await this.auditService.log(
        '00000000-0000-0000-0000-000000000000',
        'CREATE',
        'institution_setup',
        '1',
        {
          nameUz: dto.nameUz,
          adminEmail: dto.adminEmail,
          completedAt: nowIso,
        },
      );

      return {
        success: true,
        data: {
          message:
            'Muassasa sozlamalari muvaffaqiyatli saqlandi va boshqaruv tizimi ishga tushirildi / Настройка учреждения успешно завершена, система активирована',
        },
        message:
          'Muassasa sozlamalari muvaffaqiyatli saqlandi va boshqaruv tizimi ishga tushirildi / Настройка учреждения успешно завершена, система активирована',
        timestamp: nowIso,
      };
    } finally {
      // Если настройка завершена успешно, setupLock остается true навсегда
      if (!this.isConfigured) {
        this.setupLock = false;
      }
    }
  }

  /**
   * Получение полных настроек администратором (GET /admin/institution)
   * Включает как публичные, так и приватные реквизиты
   */
  async getAdminSettings(): Promise<ApiResponse<InstitutionFullSettings>> {
    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const [{ data: pubData }, { data: privData }] = await Promise.all([
          supabase.from('institution_settings').select('*').eq('id', 1).maybeSingle(),
          supabase.from('institution_private').select('*').eq('id', 1).maybeSingle(),
        ]);

        if (pubData) {
          this.publicSettings = this.mapPublicRowToDto(pubData);
          this.isConfigured = this.publicSettings.isConfigured;
        }

        if (privData) {
          this.privateSettings = this.mapPrivateRowToDto(privData);
        }
      }
    }

    return {
      success: true,
      data: {
        ...this.publicSettings,
        privateSettings: this.privateSettings,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Обновление настроек администратором (PATCH /admin/institution)
   * Полный аудит изменений со снимком до и после
   */
  async updateAdminSettings(
    dto: UpdateInstitutionDto,
    currentUser: UserProfile,
  ): Promise<ApiResponse<InstitutionFullSettings>> {
    const oldSnapshot = {
      ...this.publicSettings,
      privateSettings: { ...this.privateSettings },
    };

    const nowIso = new Date().toISOString();

    // Обновляем публичные поля
    const updatedPublic: InstitutionPublicSettings = {
      ...this.publicSettings,
      ...(dto.nameUz !== undefined ? { nameUz: dto.nameUz } : {}),
      ...(dto.nameRu !== undefined ? { nameRu: dto.nameRu } : {}),
      ...(dto.shortNameUz !== undefined ? { shortNameUz: dto.shortNameUz } : {}),
      ...(dto.shortNameRu !== undefined ? { shortNameRu: dto.shortNameRu } : {}),
      ...(dto.institutionType !== undefined ? { institutionType: dto.institutionType } : {}),
      ...(dto.legalAddressUz !== undefined ? { legalAddressUz: dto.legalAddressUz } : {}),
      ...(dto.legalAddressRu !== undefined ? { legalAddressRu: dto.legalAddressRu } : {}),
      ...(dto.mainPhone !== undefined ? { mainPhone: dto.mainPhone } : {}),
      ...(dto.admissionPhone !== undefined ? { admissionPhone: dto.admissionPhone } : {}),
      ...(dto.trustPhone !== undefined ? { trustPhone: dto.trustPhone } : {}),
      ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
      ...(dto.admissionEmail !== undefined ? { admissionEmail: dto.admissionEmail } : {}),
      ...(dto.websiteDomain !== undefined ? { websiteDomain: dto.websiteDomain } : {}),
      ...(dto.geoLatitude !== undefined ? { geoLatitude: dto.geoLatitude } : {}),
      ...(dto.geoLongitude !== undefined ? { geoLongitude: dto.geoLongitude } : {}),
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.faviconUrl !== undefined ? { faviconUrl: dto.faviconUrl } : {}),
      ...(dto.coatOfArmsUrl !== undefined ? { coatOfArmsUrl: dto.coatOfArmsUrl } : {}),
      ...(dto.brandPrimaryColor !== undefined ? { brandPrimaryColor: dto.brandPrimaryColor } : {}),
      ...(dto.socialTelegram !== undefined ? { socialTelegram: dto.socialTelegram } : {}),
      ...(dto.socialInstagram !== undefined ? { socialInstagram: dto.socialInstagram } : {}),
      ...(dto.socialFacebook !== undefined ? { socialFacebook: dto.socialFacebook } : {}),
      ...(dto.socialYoutube !== undefined ? { socialYoutube: dto.socialYoutube } : {}),
      ...(dto.stirInn !== undefined ? { stirInn: dto.stirInn } : {}),
      ...(dto.workHoursUz !== undefined ? { workHoursUz: dto.workHoursUz } : {}),
      ...(dto.workHoursRu !== undefined ? { workHoursRu: dto.workHoursRu } : {}),
      updatedAt: nowIso,
    };

    // Обновляем приватные поля
    const updatedPrivate: InstitutionPrivateSettings = {
      ...this.privateSettings,
      ...(dto.bankName !== undefined ? { bankName: dto.bankName } : {}),
      ...(dto.bankAccount !== undefined ? { bankAccount: dto.bankAccount } : {}),
      ...(dto.mfoCode !== undefined ? { mfoCode: dto.mfoCode } : {}),
      ...(dto.jshshirPinfl !== undefined ? { jshshirPinfl: dto.jshshirPinfl } : {}),
      ...(dto.treasuryAccount !== undefined ? { treasuryAccount: dto.treasuryAccount } : {}),
      ...(dto.okedCode !== undefined ? { okedCode: dto.okedCode } : {}),
      ...(dto.directorNameUz !== undefined ? { directorNameUz: dto.directorNameUz } : {}),
      ...(dto.directorNameRu !== undefined ? { directorNameRu: dto.directorNameRu } : {}),
      ...(dto.directorPhone !== undefined ? { directorPhone: dto.directorPhone } : {}),
      updatedAt: nowIso,
    };

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        await Promise.all([
          supabase
            .from('institution_settings')
            .update({
              name_uz: updatedPublic.nameUz,
              name_ru: updatedPublic.nameRu,
              short_name_uz: updatedPublic.shortNameUz,
              short_name_ru: updatedPublic.shortNameRu,
              institution_type: updatedPublic.institutionType,
              legal_address_uz: updatedPublic.legalAddressUz,
              legal_address_ru: updatedPublic.legalAddressRu,
              main_phone: updatedPublic.mainPhone,
              admission_phone: updatedPublic.admissionPhone,
              trust_phone: updatedPublic.trustPhone,
              contact_email: updatedPublic.contactEmail,
              admission_email: updatedPublic.admissionEmail,
              website_domain: updatedPublic.websiteDomain,
              geo_latitude: updatedPublic.geoLatitude,
              geo_longitude: updatedPublic.geoLongitude,
              logo_url: updatedPublic.logoUrl,
              favicon_url: updatedPublic.faviconUrl,
              coat_of_arms_url: updatedPublic.coatOfArmsUrl,
              brand_primary_color: updatedPublic.brandPrimaryColor,
              social_telegram: updatedPublic.socialTelegram,
              social_instagram: updatedPublic.socialInstagram,
              social_facebook: updatedPublic.socialFacebook,
              social_youtube: updatedPublic.socialYoutube,
              stir_inn: updatedPublic.stirInn,
              work_hours_uz: updatedPublic.workHoursUz,
              work_hours_ru: updatedPublic.workHoursRu,
              updated_at: nowIso,
            })
            .eq('id', 1),

          supabase
            .from('institution_private')
            .update({
              bank_name: updatedPrivate.bankName,
              bank_account: updatedPrivate.bankAccount,
              mfo_code: updatedPrivate.mfoCode,
              jshshir_pinfl: updatedPrivate.jshshirPinfl,
              treasury_account: updatedPrivate.treasuryAccount,
              oked_code: updatedPrivate.okedCode,
              director_name_uz: updatedPrivate.directorNameUz,
              director_name_ru: updatedPrivate.directorNameRu,
              director_phone: updatedPrivate.directorPhone,
              updated_at: nowIso,
            })
            .eq('id', 1),
        ]);
      }
    }

    this.publicSettings = updatedPublic;
    this.privateSettings = updatedPrivate;

    // Сбрасываем кэш
    await this.cacheService.del('institution:public');
    await this.cacheService.del('institution:admin');

    // Логируем изменение в аудит
    await this.auditService.log(
      currentUser.id,
      'UPDATE',
      'institution_settings',
      '1',
      { public: updatedPublic, private: updatedPrivate },
      oldSnapshot,
    );

    return {
      success: true,
      data: {
        ...this.publicSettings,
        privateSettings: this.privateSettings,
      },
      message: 'Muassasa maʼlumotlari muvaffaqiyatli yangilandi / Данные учреждения успешно обновлены',
      timestamp: nowIso,
    };
  }

  /**
   * Загрузка брендового ассета (логотип, герб, фавикон)
   * Разрешены строго PNG, JPG, WEBP. Размер до 5 МБ (фавикон 1 МБ). SVG запрещен без санитайзера.
   */
  async uploadBrandAsset(
    file: Express.Multer.File,
    assetType: 'logo' | 'favicon' | 'coat_of_arms',
    currentUser: UserProfile,
  ): Promise<ApiResponse<{ url: string }>> {
    if (!file) {
      throw new BadRequestException('Fayl yuklanmadi / Файл не был загружен');
    }

    // Запрет SVG
    if (file.mimetype.includes('svg')) {
      throw new BadRequestException(
        'Xavfsizlik talablariga koʻra SVG formatidagi fayllar qabul qilinmaydi. Faqat PNG, JPG yoki WEBP formatidagi fayllarni yuklang / По соображениям безопасности SVG запрещен. Используйте только PNG, JPG или WEBP',
      );
    }

    const allowedMime = ['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(
        'Faqat PNG, JPG yoki WEBP formatidagi rasmlar ruxsat etilgan / Разрешены только изображения PNG, JPG или WEBP',
      );
    }

    // Ограничение размера
    const maxSize = assetType === 'favicon' ? 1 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxMb = assetType === 'favicon' ? 1 : 5;
      throw new BadRequestException(
        `Fayl hajmi ${maxMb} MB dan oshmasligi kerak / Размер файла не должен превышать ${maxMb} МБ`,
      );
    }

    const ext = file.originalname.split('.').pop() || 'png';
    const fileName = `${assetType}-${Date.now()}.${ext}`;
    let publicUrl = `/images/brand/${fileName}`;

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('news-media')
          .upload(`brand/${fileName}`, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('news-media')
            .getPublicUrl(`brand/${fileName}`);
          publicUrl = urlData.publicUrl;
        }
      }
    }

    // Логируем загрузку в аудит
    await this.auditService.log(
      currentUser.id,
      'CREATE',
      'media',
      fileName,
      { assetType, publicUrl, size: file.size },
    );

    return {
      success: true,
      data: { url: publicUrl },
      message: 'Fayl muvaffaqiyatli yuklandi / Файл успешно загружен',
      timestamp: new Date().toISOString(),
    };
  }

  // --- Вспомогательные мапперы ---

  private mapPublicRowToDto(row: Record<string, unknown>): InstitutionPublicSettings {
    return {
      id: Number(row.id || 1),
      nameUz: String(row.name_uz || ''),
      nameRu: String(row.name_ru || ''),
      shortNameUz: String(row.short_name_uz || ''),
      shortNameRu: String(row.short_name_ru || ''),
      institutionType: String(row.institution_type || 'texnikum'),
      legalAddressUz: String(row.legal_address_uz || ''),
      legalAddressRu: String(row.legal_address_ru || ''),
      mainPhone: String(row.main_phone || ''),
      admissionPhone: String(row.admission_phone || ''),
      trustPhone: String(row.trust_phone || ''),
      contactEmail: String(row.contact_email || ''),
      admissionEmail: String(row.admission_email || ''),
      websiteDomain: String(row.website_domain || ''),
      geoLatitude: Number(row.geo_latitude || 40.3864),
      geoLongitude: Number(row.geo_longitude || 71.7864),
      logoUrl: row.logo_url ? String(row.logo_url) : null,
      faviconUrl: row.favicon_url ? String(row.favicon_url) : null,
      coatOfArmsUrl: row.coat_of_arms_url ? String(row.coat_of_arms_url) : null,
      brandPrimaryColor: String(row.brand_primary_color || '#1e3a8a'),
      socialTelegram: row.social_telegram ? String(row.social_telegram) : null,
      socialInstagram: row.social_instagram ? String(row.social_instagram) : null,
      socialFacebook: row.social_facebook ? String(row.social_facebook) : null,
      socialYoutube: row.social_youtube ? String(row.social_youtube) : null,
      stirInn: String(row.stir_inn || ''),
      workHoursUz: String(row.work_hours_uz || 'Dushanba – Shanba: 08:30 – 17:30'),
      workHoursRu: String(row.work_hours_ru || 'Понедельник – Суббота: 08:30 – 17:30'),
      isConfigured: Boolean(row.is_configured),
      setupCompletedAt: row.setup_completed_at ? String(row.setup_completed_at) : null,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString()),
    };
  }

  private mapPrivateRowToDto(row: Record<string, unknown>): InstitutionPrivateSettings {
    return {
      id: Number(row.id || 1),
      bankName: row.bank_name ? String(row.bank_name) : null,
      bankAccount: row.bank_account ? String(row.bank_account) : null,
      mfoCode: row.mfo_code ? String(row.mfo_code) : null,
      jshshirPinfl: row.jshshir_pinfl ? String(row.jshshir_pinfl) : null,
      treasuryAccount: row.treasury_account ? String(row.treasury_account) : null,
      okedCode: row.oked_code ? String(row.oked_code) : null,
      directorNameUz: row.director_name_uz ? String(row.director_name_uz) : null,
      directorNameRu: row.director_name_ru ? String(row.director_name_ru) : null,
      directorPhone: row.director_phone ? String(row.director_phone) : null,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString()),
    };
  }
}
