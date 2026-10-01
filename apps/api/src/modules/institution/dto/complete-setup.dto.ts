import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteSetupDto {
  @ApiProperty({
    description: 'Мастер-токен для завершения настройки из переменной SETUP_TOKEN',
    example: 'setup_secret_key_1234567890abcdef',
  })
  @IsString({ message: 'Oʻrnatish kodi matn koʻrinishida boʻlishi shart / Код установки должен быть строкой' })
  @IsNotEmpty({ message: 'Oʻrnatish kodi kiritilishi shart / Код установки обязателен' })
  setupToken!: string;

  @ApiProperty({
    description: 'Email первого главного администратора учреждения',
    example: 'admin@kollej.uz',
  })
  @IsEmail({}, { message: 'Elektron pochta manzili toʻgʻri formatda kiritilishi lozim / Введите корректный адрес электронной почты' })
  @IsNotEmpty({ message: 'Administrator pochtasi kiritilishi shart / Email администратора обязателен' })
  adminEmail!: string;

  @ApiProperty({
    description: 'Надежный пароль администратора (мин. 8 символов, заглавная, строчная, цифра, спецсимвол)',
    example: 'Admin2026!Secure',
  })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/,
    {
      message:
        'Parol kamida 8 ta belgidan iborat boʻlishi, katta va kichik harflar, raqam va maxsus belgini (@$!%*?&#^()_-+=) oʻz ichiga olishi kerak / Пароль должен содержать минимум 8 символов, заглавную и строчную буквы, цифру и специальный символ',
    },
  )
  adminPassword!: string;

  @ApiProperty({
    description: 'Полное ФИО главного администратора',
    example: 'Karimov Jasur Alisherovich',
  })
  @IsString()
  @MinLength(3, { message: 'Administrator F.I.O. kamida 3 ta belgidan iborat boʻlishi kerak / ФИО администратора должно содержать минимум 3 символа' })
  adminFullName!: string;

  // ---------------------------------------------------------------------------
  // Публичные настройки учреждения (InstitutionPublicSettings)
  // ---------------------------------------------------------------------------

  @ApiProperty({ description: 'Полное название на узбекском', example: 'Toshkent axborot texnologiyalari texnikumi' })
  @IsString()
  @MinLength(3, { message: 'Muassasa nomi (UZ) kamida 3 ta belgidan iborat boʻlishi kerak / Название учреждения (UZ) должно содержать минимум 3 символа' })
  nameUz!: string;

  @ApiProperty({ description: 'Полное название на русском', example: 'Ташкентский техникум информационных технологий' })
  @IsString()
  @MinLength(3, { message: 'Muassasa nomi (RU) kamida 3 ta belgidan iborat boʻlishi kerak / Название учреждения (RU) должно содержать минимум 3 символа' })
  nameRu!: string;

  @ApiProperty({ description: 'Краткое название на узбекском', example: 'Toshkent IT texnikumi' })
  @IsString()
  @MinLength(2, { message: 'Qisqa nom (UZ) kamida 2 ta belgidan iborat boʻlishi kerak / Краткое наименование (UZ) должно содержать минимум 2 символа' })
  shortNameUz!: string;

  @ApiProperty({ description: 'Краткое название на русском', example: 'Ташкентский IT техникум' })
  @IsString()
  @MinLength(2, { message: 'Qisqa nom (RU) kamida 2 ta belgidan iborat boʻlishi kerak / Краткое наименование (RU) должно содержать минимум 2 символа' })
  shortNameRu!: string;

  @ApiProperty({ description: 'Тип учреждения', example: 'texnikum' })
  @IsString()
  @IsNotEmpty({ message: 'Muassasa turi tanlanishi kerak / Тип учреждения обязателен' })
  institutionType!: string;

  @ApiProperty({ description: 'Юридический адрес на узбекском', example: '100000, Toshkent shahri, Amir Temur koʻchasi, 10-uy' })
  @IsString()
  @IsNotEmpty({ message: 'Yuridik manzil (UZ) kiritilishi shart / Юридический адрес (UZ) обязателен' })
  legalAddressUz!: string;

  @ApiProperty({ description: 'Юридический адрес на русском', example: '100000, г. Ташкент, ул. Амира Темура, д. 10' })
  @IsString()
  @IsNotEmpty({ message: 'Yuridik manzil (RU) kiritilishi shart / Юридический адрес (RU) обязателен' })
  legalAddressRu!: string;

  @ApiProperty({ description: 'Основной телефон (+998)', example: '+998 (71) 200-00-00' })
  @IsString()
  @Matches(/^\+998\s?\(?\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/, {
    message: 'Telefon raqami +998 (XX) XXX-XX-XX formatida boʻlishi kerak / Номер телефона должен быть в формате +998',
  })
  mainPhone!: string;

  @ApiPropertyOptional({ description: 'Телефон приемной комиссии', example: '+998 (71) 200-00-01' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998\s?\(?\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/, {
    message: 'Qabul telefoni +998 (XX) XXX-XX-XX formatida boʻlishi kerak / Номер телефона приемной должен быть в формате +998',
  })
  admissionPhone?: string;

  @ApiPropertyOptional({ description: 'Телефон доверия', example: '1006' })
  @IsOptional()
  @IsString()
  trustPhone?: string;

  @ApiProperty({ description: 'Email для обращений', example: 'info@kollej.uz' })
  @IsEmail({}, { message: 'Elektron pochta manzili toʻgʻri formatda kiritilishi lozim / Введите корректный адрес электронной почты' })
  contactEmail!: string;

  @ApiPropertyOptional({ description: 'Email приемной комиссии', example: 'qabul@kollej.uz' })
  @IsOptional()
  @IsEmail({}, { message: 'Qabul komissiyasi pochtasi toʻgʻri formatda boʻlishi lozim / Корректный адрес приемной комиссии' })
  admissionEmail?: string;

  @ApiPropertyOptional({ description: 'Официальный домен учреждения', example: 'kollej.uz' })
  @IsOptional()
  @IsString()
  websiteDomain?: string;

  @ApiProperty({ description: 'Географическая широта (-90..90)', example: 41.311158 })
  @IsNumber({}, { message: 'Kenglik raqam boʻlishi kerak / Широта должна быть числом' })
  @Min(-90, { message: 'Kenglik -90 dan kichik boʻlishi mumkin emas / Широта не может быть меньше -90' })
  @Max(90, { message: 'Kenglik 90 dan katta boʻlishi mumkin emas / Широта не может быть больше 90' })
  geoLatitude!: number;

  @ApiProperty({ description: 'Географическая долгота (-180..180)', example: 69.279737 })
  @IsNumber({}, { message: 'Uzunlik raqam boʻlishi kerak / Долгота должна быть числом' })
  @Min(-180, { message: 'Uzunlik -180 dan kichik boʻlishi mumkin emas / Долгота не может быть меньше -180' })
  @Max(180, { message: 'Uzunlik 180 dan katta boʻlishi mumkin emas / Долгота не может быть больше 180' })
  geoLongitude!: number;

  @ApiPropertyOptional({ description: 'URL логотипа (PNG, JPG, WEBP)', example: '/images/logo.webp' })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL фавикона (PNG, ICO, WEBP)', example: '/favicon.ico' })
  @IsOptional()
  @IsString()
  faviconUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL герба или эмблемы', example: '/images/gerb.webp' })
  @IsOptional()
  @IsString()
  coatOfArmsUrl?: string | null;

  @ApiProperty({ description: 'Основной цвет бренда (HEX)', example: '#1e3a8a' })
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Rang kodi #RGB yoki #RRGGBB formatida boʻlishi kerak / Код цвета должен быть в формате #RGB или #RRGGBB',
  })
  brandPrimaryColor!: string;

  @ApiPropertyOptional({ description: 'Telegram канал', example: 'https://t.me/kollej_rasmiy' })
  @IsOptional()
  @IsString()
  socialTelegram?: string | null;

  @ApiPropertyOptional({ description: 'Instagram страница', example: 'https://instagram.com/kollej_rasmiy' })
  @IsOptional()
  @IsString()
  socialInstagram?: string | null;

  @ApiPropertyOptional({ description: 'Facebook страница', example: 'https://facebook.com/kollej_rasmiy' })
  @IsOptional()
  @IsString()
  socialFacebook?: string | null;

  @ApiPropertyOptional({ description: 'YouTube канал', example: 'https://youtube.com/@kollej_rasmiy' })
  @IsOptional()
  @IsString()
  socialYoutube?: string | null;

  @ApiProperty({ description: 'СТИР / ИНН учреждения (9 цифр)', example: '302987654' })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'STIR/INN 9 ta raqamdan iborat boʻlishi kerak / СТИР/ИНН должен состоять из 9 цифр',
  })
  stirInn!: string;

  @ApiPropertyOptional({ description: 'График работы на узбекском', example: 'Dushanba – Shanba: 08:30 – 17:30' })
  @IsOptional()
  @IsString()
  workHoursUz?: string;

  @ApiPropertyOptional({ description: 'График работы на русском', example: 'Понедельник – Суббота: 08:30 – 17:30' })
  @IsOptional()
  @IsString()
  workHoursRu?: string;

  // ---------------------------------------------------------------------------
  // Приватные настройки учреждения (InstitutionPrivateSettings, опционально)
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({ description: 'Обслуживающий банк', example: 'Oʻzmilliybank Toshkent shahar boshqarmasi' })
  @IsOptional()
  @IsString()
  bankName?: string | null;

  @ApiPropertyOptional({ description: 'Расчетный счет (20 цифр)', example: '23402000300100001010' })
  @IsOptional()
  @IsString()
  bankAccount?: string | null;

  @ApiPropertyOptional({ description: 'МФО банка (5 цифр)', example: '00014' })
  @IsOptional()
  @IsString()
  mfoCode?: string | null;

  @ApiPropertyOptional({ description: 'ЖШШИР / ПИНФЛ (14 цифр)', example: '31205851234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'JSHSHIR/PINFL 14 ta raqamdan iborat boʻlishi kerak / ПИНФЛ должен состоять из 14 цифр',
  })
  jshshirPinfl?: string | null;

  @ApiPropertyOptional({ description: 'Казначейский лицевой счет', example: '400110860262667950100075001' })
  @IsOptional()
  @IsString()
  treasuryAccount?: string | null;

  @ApiPropertyOptional({ description: 'ОКЭД (5 цифр)', example: '85320' })
  @IsOptional()
  @IsString()
  okedCode?: string | null;

  @ApiPropertyOptional({ description: 'ФИО директора на узбекском', example: 'Karimov Jasur Alisherovich' })
  @IsOptional()
  @IsString()
  directorNameUz?: string | null;

  @ApiPropertyOptional({ description: 'ФИО директора на русском', example: 'Каримов Жасур Алишерович' })
  @IsOptional()
  @IsString()
  directorNameRu?: string | null;

  @ApiPropertyOptional({ description: 'Телефон директора', example: '+998 (71) 200-00-05' })
  @IsOptional()
  @IsString()
  directorPhone?: string | null;
}
