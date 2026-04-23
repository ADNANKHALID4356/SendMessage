import { IsString, IsOptional, IsBoolean, MaxLength, MinLength, IsHexColor, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Workspace name', example: 'E-commerce Store' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description:
      'Tenant slug used for subdomain routing (lowercase DNS label). If omitted, a slug is generated from the name.',
    example: 'acme-corp',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(63)
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, {
    message:
      'slug must be lowercase DNS-safe (letters, numbers, hyphen; cannot start/end with hyphen)',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Workspace description', example: 'Main online store' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Color theme (hex)', example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  colorTheme?: string;
}

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ description: 'Workspace name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Workspace description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Color theme (hex)' })
  @IsOptional()
  @IsHexColor()
  colorTheme?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  sortOrder?: number;
}

export class AssignUserDto {
  @ApiProperty({ description: 'User ID to assign' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Permission level',
    enum: ['VIEW_ONLY', 'OPERATOR', 'MANAGER'],
  })
  @IsString()
  permissionLevel: 'VIEW_ONLY' | 'OPERATOR' | 'MANAGER';
}
