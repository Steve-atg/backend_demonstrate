import { TransactionResponseDto } from './transaction-response.dto';

export class PaginatedTransactionsResponseDto {
  data: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
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
