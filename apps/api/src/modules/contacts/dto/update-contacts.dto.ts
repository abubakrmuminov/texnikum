import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CampusItem,
  ContactsDirections,
  ContactsMapCoordinates,
  PhoneDirectoryItem,
} from '@college/shared';

export class CampusItemDto implements CampusItem {
  @ApiProperty({ description: 'ID корпуса' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Название корпуса' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Адрес корпуса' })
  @IsString()
  address!: string;

  @ApiProperty({ description: 'Размещенные отделы и службы' })
  @IsString()
  departments!: string;

  @ApiProperty({ description: 'Телефон' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Email' })
  @IsString()
  email!: string;

  @ApiProperty({ description: 'График работы' })
  @IsString()
  workHours!: string;

  @ApiProperty({ description: 'Остановка и транспорт' })
  @IsString()
  transport!: string;

  @ApiProperty({ required: false, description: 'Порядковый номер' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class PhoneDirectoryItemDto implements PhoneDirectoryItem {
  @ApiProperty({ description: 'ID записи' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Название отдела' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Номер телефона' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Описание и назначение' })
  @IsString()
  note!: string;

  @ApiProperty({ required: false, description: 'Порядковый номер' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class ContactsDirectionsDto implements ContactsDirections {
  @ApiProperty({ description: 'Маршруты общественного транспорта' })
  @IsString()
  bus!: string;

  @ApiProperty({ description: 'Ориентиры' })
  @IsString()
  landmark!: string;
}

export class ContactsMapCoordinatesDto implements ContactsMapCoordinates {
  @ApiProperty({ description: 'Широта' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ description: 'Долгота' })
  @IsNumber()
  lng!: number;

  @ApiProperty({ description: 'Масштаб карты' })
  @IsNumber()
  zoom!: number;
}

export class UpdateContactsDto {
  @ApiProperty({ type: [CampusItemDto], description: 'Список корпусов техникума' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampusItemDto)
  campuses!: CampusItemDto[];

  @ApiProperty({ type: [PhoneDirectoryItemDto], description: 'Телефонный справочник' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDirectoryItemDto)
  phones!: PhoneDirectoryItemDto[];

  @ApiProperty({ type: ContactsDirectionsDto, description: 'Схема проезда' })
  @ValidateNested()
  @Type(() => ContactsDirectionsDto)
  directions!: ContactsDirectionsDto;

  @ApiProperty({ type: ContactsMapCoordinatesDto, description: 'Координаты на карте' })
  @ValidateNested()
  @Type(() => ContactsMapCoordinatesDto)
  mapCoordinates!: ContactsMapCoordinatesDto;
}
