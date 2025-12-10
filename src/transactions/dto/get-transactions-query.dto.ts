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
  IsUUID,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class GetTransactionsQueryDto {
  // Search filters
  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.SPEND,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by currency code',
    example: 'HKD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Minimum transaction amount',
    example: 10.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum transaction amount',
    example: 1000.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter by exact description match',
    example: 'Grocery shopping',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category IDs',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  // Date filters
  @ApiPropertyOptional({
    description: 'Filter transactions after this date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  transactionDateAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter transactions before this date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  transactionDateBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date (after)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date (before)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  // Search term (searches in description)
  @ApiPropertyOptional({
    description: 'Search term for description (partial match)',
    example: 'grocery',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: [
      'type',
      'amount',
      'currency',
      'transactionDate',
      'createdAt',
      'updatedAt',
    ],
    example: 'transactionDate',
    default: 'transactionDate',
  })
  @IsOptional()
  @IsIn([
    'type',
    'amount',
    'currency',
    'transactionDate',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string = 'transactionDate';

  @ApiPropertyOptional({
    description: 'Sort order (ascending or descending)',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
