import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInstitutionDto {
  // ---------------------------------------------------------------------------
  // Публичные поля
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({ description: 'Полное название на узбекском', example: 'Fargʻona 2-son texnikumi' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Muassasa nomi (UZ) kamida 3 ta belgidan iborat boʻlishi kerak / Название учреждения (UZ) должно содержать минимум 3 символа' })
  nameUz?: string;

  @ApiPropertyOptional({ description: 'Полное название на русском', example: 'Ферганский техникум № 2' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Muassasa nomi (RU) kamida 3 ta belgidan iborat boʻlishi kerak / Название учреждения (RU) должно содержать минимум 3 символа' })
  nameRu?: string;

  @ApiPropertyOptional({ description: 'Краткое название на узбекском', example: '2-son texnikum' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Qisqa nom (UZ) kamida 2 ta belgidan iborat boʻlishi kerak / Краткое наименование (UZ) должно содержать минимум 2 символа' })
  shortNameUz?: string;

  @ApiPropertyOptional({ description: 'Краткое название на русском', example: 'Техникум № 2' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Qisqa nom (RU) kamida 2 ta belgidan iborat boʻlishi kerak / Краткое наименование (RU) должно содержать минимум 2 символа' })
  shortNameRu?: string;

  @ApiPropertyOptional({ description: 'Тип учреждения', example: 'texnikum' })
  @IsOptional()
  @IsString()
  institutionType?: string;

  @ApiPropertyOptional({ description: 'Юридический адрес на узбекском' })
  @IsOptional()
  @IsString()
  legalAddressUz?: string;

  @ApiPropertyOptional({ description: 'Юридический адрес на русском' })
  @IsOptional()
  @IsString()
  legalAddressRu?: string;

  @ApiPropertyOptional({ description: 'Основной телефон (+998)', example: '+998 (73) 244-00-00' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998\s?\(?\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/, {
    message: 'Telefon raqami +998 (XX) XXX-XX-XX formatida boʻlishi kerak / Номер телефона должен быть в формате +998',
  })
  mainPhone?: string;

  @ApiPropertyOptional({ description: 'Телефон приемной комиссии', example: '+998 (73) 244-00-00' })
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

  @ApiPropertyOptional({ description: 'Email для обращений', example: 'info@texnikum2.uz' })
  @IsOptional()
  @IsEmail({}, { message: 'Elektron pochta manzili toʻgʻri formatda kiritilishi lozim / Введите корректный адрес электронной почты' })
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Email приемной комиссии', example: 'priem@texnikum2.uz' })
  @IsOptional()
  @IsEmail({}, { message: 'Qabul komissiyasi pochtasi toʻgʻri formatda boʻlishi lozim / Корректный адрес приемной комиссии' })
  admissionEmail?: string;

  @ApiPropertyOptional({ description: 'Официальный домен учреждения', example: 'texnikum2.uz' })
  @IsOptional()
  @IsString()
  websiteDomain?: string;

  @ApiPropertyOptional({ description: 'Широта (-90..90)', example: 40.386400 })
  @IsOptional()
  @IsNumber({}, { message: 'Kenglik raqam boʻlishi kerak / Широта должна быть числом' })
  @Min(-90, { message: 'Kenglik -90 dan kichik boʻlishi mumkin emas / Широта не может быть меньше -90' })
  @Max(90, { message: 'Kenglik 90 dan katta boʻlishi mumkin emas / Широта не может быть больше 90' })
  geoLatitude?: number;

  @ApiPropertyOptional({ description: 'Долгота (-180..180)', example: 71.786400 })
  @IsOptional()
  @IsNumber({}, { message: 'Uzunlik raqam boʻlishi kerak / Долгота должна быть числом' })
  @Min(-180, { message: 'Uzunlik -180 dan kichik boʻlishi mumkin emas / Долгота не может быть меньше -180' })
  @Max(180, { message: 'Uzunlik 180 dan katta boʻlishi mumkin emas / Долгота не может быть больше 180' })
  geoLongitude?: number;

  @ApiPropertyOptional({ description: 'URL логотипа', example: '/images/logo.webp' })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL фавикона', example: '/favicon.ico' })
  @IsOptional()
  @IsString()
  faviconUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL герба', example: '/images/gerb.webp' })
  @IsOptional()
  @IsString()
  coatOfArmsUrl?: string | null;

  @ApiPropertyOptional({ description: 'Основной цвет бренда (HEX)', example: '#1e3a8a' })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Rang kodi #RGB yoki #RRGGBB formatida boʻlishi kerak / Код цвета должен быть в формате #RGB или #RRGGBB',
  })
  brandPrimaryColor?: string;

  @ApiPropertyOptional({ description: 'Telegram канал', example: 'https://t.me/fargona_texnikum2' })
  @IsOptional()
  @IsString()
  socialTelegram?: string | null;

  @ApiPropertyOptional({ description: 'Instagram страница' })
  @IsOptional()
  @IsString()
  socialInstagram?: string | null;

  @ApiPropertyOptional({ description: 'Facebook страница' })
  @IsOptional()
  @IsString()
  socialFacebook?: string | null;

  @ApiPropertyOptional({ description: 'YouTube канал' })
  @IsOptional()
  @IsString()
  socialYoutube?: string | null;

  @ApiPropertyOptional({ description: 'СТИР / ИНН (9 цифр)', example: '302987654' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'STIR/INN 9 ta raqamdan iborat boʻlishi kerak / СТИР/ИНН должен состоять из 9 цифр',
  })
  stirInn?: string;

  @ApiPropertyOptional({ description: 'График работы на узбекском' })
  @IsOptional()
  @IsString()
  workHoursUz?: string;

  @ApiPropertyOptional({ description: 'График работы на русском' })
  @IsOptional()
  @IsString()
  workHoursRu?: string;

  // ---------------------------------------------------------------------------
  // Приватные поля
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({ description: 'Обслуживающий банк' })
  @IsOptional()
  @IsString()
  bankName?: string | null;

  @ApiPropertyOptional({ description: 'Расчетный счет' })
  @IsOptional()
  @IsString()
  bankAccount?: string | null;

  @ApiPropertyOptional({ description: 'МФО банка (5 цифр)' })
  @IsOptional()
  @IsString()
  mfoCode?: string | null;

  @ApiPropertyOptional({ description: 'ЖШШИР / ПИНФЛ (14 цифр)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'JSHSHIR/PINFL 14 ta raqamdan iborat boʻlishi kerak / ПИНФЛ должен состоять из 14 цифр',
  })
  jshshirPinfl?: string | null;

  @ApiPropertyOptional({ description: 'Казначейский лицевой счет' })
  @IsOptional()
  @IsString()
  treasuryAccount?: string | null;

  @ApiPropertyOptional({ description: 'ОКЭД (5 цифр)' })
  @IsOptional()
  @IsString()
  okedCode?: string | null;

  @ApiPropertyOptional({ description: 'ФИО директора на узбекском' })
  @IsOptional()
  @IsString()
  directorNameUz?: string | null;

  @ApiPropertyOptional({ description: 'ФИО директора на русском' })
  @IsOptional()
  @IsString()
  directorNameRu?: string | null;

  @ApiPropertyOptional({ description: 'Телефон директора' })
  @IsOptional()
  @IsString()
  directorPhone?: string | null;
}
