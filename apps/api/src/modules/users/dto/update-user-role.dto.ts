import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@college/shared';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, description: 'Новая роль пользователя' })
  @IsEnum(UserRole, { message: 'Роль должна быть admin, editor или moderator' })
  @IsNotEmpty()
  role!: UserRole;
}
