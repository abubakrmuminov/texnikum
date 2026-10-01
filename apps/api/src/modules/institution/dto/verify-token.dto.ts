import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty({
    description: 'Секретный код первичной настройки (SETUP_TOKEN)',
    example: 'college-setup-secret-token-2026-whitelabel-key',
  })
  @IsString({ message: 'Oʻrnatish kodi matn koʻrinishida boʻlishi kerak / Токен установки должен быть строкой' })
  @IsNotEmpty({ message: 'Oʻrnatish kodi (SETUP_TOKEN) kiritilishi shart / Код установки (SETUP_TOKEN) обязателен' })
  setupToken!: string;
}
