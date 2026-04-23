import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ImpersonateUserDto {
  @ApiProperty({ description: 'Target user id to act as' })
  @IsUUID()
  userId!: string;
}
