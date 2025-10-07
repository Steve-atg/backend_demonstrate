import { Transaction, User, Category } from '@prisma/client';

export class TransactionResponseDto {
  id: string;
  type: string;
  amount: number;
  currency: string;
  transactionDate: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: Partial<User>;
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

    // Extract user information if included
    if (
      transaction.userTransactions &&
      transaction.userTransactions.length > 0
    ) {
      const user = transaction.userTransactions[0].user;
      this.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }

    // Extract categories if included
    if (transaction.transactionCategory) {
      this.categories = transaction.transactionCategory.map(
        (tc) => tc.category,
      );
    }
  }
}
