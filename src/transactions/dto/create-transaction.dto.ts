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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The type of transaction',
    enum: TransactionType,
    example: TransactionType.SPEND,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'The amount of the transaction',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'The currency code (3 characters)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    description: 'The date when the transaction occurred',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({
    description: 'Optional description of the transaction',
    example: 'Grocery shopping at Walmart',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The ID of the user who made the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Array of category IDs associated with the transaction',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
