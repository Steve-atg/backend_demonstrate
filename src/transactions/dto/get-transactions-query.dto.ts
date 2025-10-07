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
import { TransactionType } from '@prisma/client';

export class GetTransactionsQueryDto {
  // Search filters
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  // Date filters
  @IsOptional()
  @IsDateString()
  transactionDateAfter?: string;

  @IsOptional()
  @IsDateString()
  transactionDateBefore?: string;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  // Search term (searches in description)
  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Sorting
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

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
