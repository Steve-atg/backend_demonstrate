import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction, User, Category } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction type',
    example: 'SPEND',
  })
  type: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 29.99,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Date when the transaction occurred',
    example: '2024-01-15T10:30:00.000Z',
  })
  transactionDate: Date;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Grocery shopping at Walmart',
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Associated categories',
    type: 'array',
  })
  categories?: Category[];

  constructor(
    transaction: Transaction & {
      userTransactions?: Array<{
        user: User;
      }>;
      transactionCategory?: Array<{
        category: Category;
      }>;
    },
  ) {
    this.id = transaction.id;
    this.type = transaction.type;
    this.amount = Number(transaction.amount);
    this.currency = transaction.currency;
    this.transactionDate = transaction.transactionDate;
    this.description = transaction.description;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;

    // Extract categories if included
    if (transaction.transactionCategory) {
      this.categories = transaction.transactionCategory.map(
        (tc) => tc.category,
      );
    }
  }
}
