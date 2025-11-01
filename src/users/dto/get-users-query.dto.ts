import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class GetUsersQueryDto {
  // Search filters
  @ApiProperty({
    description: 'Filter by username (partial match)',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Filter by email (partial match)',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Filter by gender',
    enum: Gender,
    example: 'M',
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Filter by exact user level',
    example: 5,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userLevel?: number;

  @ApiProperty({
    description: 'Filter by minimum user level',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minUserLevel?: number;

  @ApiProperty({
    description: 'Filter by maximum user level',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUserLevel?: number;

  // Date filters
  @ApiProperty({
    description: 'Filter users created after this date',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiProperty({
    description: 'Filter users created before this date',
    example: '2023-12-31T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiProperty({
    description: 'Filter users born after this date',
    example: '1990-01-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  bornAfter?: string;

  @ApiProperty({
    description: 'Filter users born before this date',
    example: '2000-12-31T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  bornBefore?: string;

  // Search term (searches in username and email)
  @ApiProperty({
    description: 'Global search term (searches in username and email)',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Sorting
  @ApiProperty({
    description: 'Field to sort by',
    enum: ['username', 'email', 'userLevel', 'createdAt', 'updatedAt'],
    example: 'username',
    default: 'username',
    required: false,
  })
  @IsOptional()
  @IsIn(['username', 'email', 'userLevel', 'createdAt', 'updatedAt'])
  sortBy?: string = 'username';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
