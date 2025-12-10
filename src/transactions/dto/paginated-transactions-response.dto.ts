import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';

export class PaginatedTransactionsResponseDto {
  @ApiProperty({
    description: 'Array of transactions',
    type: [TransactionResponseDto],
  })
  data: TransactionResponseDto[];

  @ApiProperty({
    description: 'Total number of transactions matching the query',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  constructor(
    transactions: TransactionResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = transactions;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
