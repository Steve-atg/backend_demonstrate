import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
  Length,
} from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;

  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
