import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ description: 'ФИО преподавателя', example: 'Смирнова Елена Николаевна' })
  @IsString()
  @IsNotEmpty({ message: 'ФИО обязательно для заполнения' })
  fullName!: string;

  @ApiPropertyOptional({ description: 'Символьный slug', example: 'smirnova-elena-nikolaevna' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Должность', example: 'Заведующая отделением, преподаватель высшей категории' })
  @IsString()
  @IsNotEmpty({ message: 'Должность обязательна' })
  position!: string;

  @ApiPropertyOptional({ description: 'ID отделения' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: 'Преподаваемые дисциплины', example: ['Основы алгоритмизации', 'Веб-разработка'] })
  @IsArray()
  @IsString({ each: true })
  subjects!: string[];

  @ApiProperty({ description: 'Уровень квалификации / категория', example: 'Высшая квалификационная категория' })
  @IsString()
  @IsNotEmpty({ message: 'Квалификация обязательна' })
  qualification!: string;

  @ApiPropertyOptional({ description: 'Уровень образования и вуз' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ description: 'Общий трудовой стаж (лет)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Стаж работы по специальности (лет)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  teachingExperienceYears?: number;

  @ApiPropertyOptional({ description: 'Краткая биография и достижения' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'URL фотографии преподавателя' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Контактный email' })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Статус активности', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;
}
