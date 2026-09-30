import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '@college/shared';

export class CreateAuditDto {
  @ApiProperty({
    enum: ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE'],
    example: 'CREATE',
    description: 'Тип административного действия',
  })
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE'], {
    message: 'Недопустимый тип действия аудита',
  })
  action!: AuditAction;

  @ApiProperty({ example: 'administration', description: 'Тип сущности' })
  @IsString()
  @IsNotEmpty({ message: 'Тип сущности не может быть пустым' })
  entityType!: string;

  @ApiProperty({ example: 'admin-101', description: 'Идентификатор записи' })
  @IsString()
  @IsNotEmpty({ message: 'Идентификатор записи не может быть пустым' })
  entityId!: string;

  @ApiPropertyOptional({ description: 'Новые значения объекта в формате JSON' })
  @IsObject()
  @IsOptional()
  newValues?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Предыдущие значения объекта в формате JSON' })
  @IsObject()
  @IsOptional()
  oldValues?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '127.0.0.1', description: 'IP-адрес инициатора' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}
