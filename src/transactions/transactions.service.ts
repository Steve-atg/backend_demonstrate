import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  GetTransactionsQueryDto,
  PaginatedTransactionsResponseDto,
} from './dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    currentUserId: string,
    isAdmin: boolean = false,
  ): Promise<TransactionResponseDto> {
    // If not admin, user can only create transactions for themselves
    if (!isAdmin && createTransactionDto.userId !== currentUserId) {
      throw new ConflictException(
        'You can only create transactions for yourself',
      );
    }

    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: { id: createTransactionDto.userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if categories exist (if provided)
    if (createTransactionDto.categoryIds) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: createTransactionDto.categoryIds } },
      });

      if (categories.length !== createTransactionDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        type: createTransactionDto.type,
        amount: createTransactionDto.amount,
        currency: createTransactionDto.currency.toUpperCase(),
        transactionDate: new Date(createTransactionDto.transactionDate),
        description: createTransactionDto.description,
        userTransactions: {
          create: {
            userId: createTransactionDto.userId,
          },
        },
        transactionCategory: createTransactionDto.categoryIds
          ? {
              create: createTransactionDto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
      },
      include: {
        userTransactions: {
          include: {
            user: true,
          },
        },
        transactionCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return new TransactionResponseDto(transaction);
  }

  async findAll(
    queryDto?: GetTransactionsQueryDto,
    currentUserId?: string,
    isAdmin: boolean = false,
  ): Promise<TransactionResponseDto[] | PaginatedTransactionsResponseDto> {
    try {
      // If no query parameters, return simple list
      if (!queryDto) {
        const transactions = await this.prisma.transaction.findMany({
          where: { isDeleted: false },
          orderBy: { transactionDate: 'desc' },
          include: {
            userTransactions: {
              include: {
                user: true,
              },
            },
            transactionCategory: {
              include: {
                category: true,
              },
            },
          },
        });

        return transactions.map(
          (transaction) => new TransactionResponseDto(transaction),
        );
      }
    } catch (error) {
      // Let the global exception filter handle Prisma errors
      throw error;
    }

    // Build where clause
    const where: any = { isDeleted: false };

    // If not admin, filter to only show user's own transactions
    if (!isAdmin && currentUserId) {
      where.userTransactions = {
        some: {
          userId: currentUserId,
        },
      };
    }

    // Type filter
    if (queryDto.type) {
      where.type = queryDto.type;
    }

    // Currency filter
    if (queryDto.currency) {
      where.currency = queryDto.currency.toUpperCase();
    }

    // Amount filters
    if (queryDto.minAmount || queryDto.maxAmount) {
      where.amount = {};
      if (queryDto.minAmount) {
        where.amount.gte = queryDto.minAmount;
      }
      if (queryDto.maxAmount) {
        where.amount.lte = queryDto.maxAmount;
      }
    }

    // Description filter
    if (queryDto.description) {
      where.description = {
        contains: queryDto.description,
        mode: 'insensitive',
      };
    }

    // User filter
    if (queryDto.userId) {
      where.userTransactions = {
        some: {
          userId: queryDto.userId,
        },
      };
    }

    // Category filter
    if (queryDto.categoryIds && queryDto.categoryIds.length > 0) {
      where.transactionCategory = {
        some: {
          categoryId: {
            in: queryDto.categoryIds,
          },
        },
      };
    }

    // Transaction date filters
    if (queryDto.transactionDateAfter || queryDto.transactionDateBefore) {
      where.transactionDate = {};
      if (queryDto.transactionDateAfter) {
        const transactionDateAfter = new Date(queryDto.transactionDateAfter);
        if (isNaN(transactionDateAfter.getTime())) {
          throw new ConflictException(
            'Invalid transactionDateAfter date format',
          );
        }
        where.transactionDate.gte = transactionDateAfter;
      }
      if (queryDto.transactionDateBefore) {
        const transactionDateBefore = new Date(queryDto.transactionDateBefore);
        if (isNaN(transactionDateBefore.getTime())) {
          throw new ConflictException(
            'Invalid transactionDateBefore date format',
          );
        }
        where.transactionDate.lte = transactionDateBefore;
      }
    }

    // Creation date filters
    if (queryDto.createdAfter || queryDto.createdBefore) {
      where.createdAt = {};
      if (queryDto.createdAfter) {
        const createdAfter = new Date(queryDto.createdAfter);
        if (isNaN(createdAfter.getTime())) {
          throw new ConflictException('Invalid createdAfter date format');
        }
        where.createdAt.gte = createdAfter;
      }
      if (queryDto.createdBefore) {
        const createdBefore = new Date(queryDto.createdBefore);
        if (isNaN(createdBefore.getTime())) {
          throw new ConflictException('Invalid createdBefore date format');
        }
        where.createdAt.lte = createdBefore;
      }
    }

    // Search term (searches in description)
    if (queryDto.search) {
      where.description = {
        contains: queryDto.search,
        mode: 'insensitive',
      };
    }

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;

    // Validate pagination parameters
    if (page < 1) {
      throw new ConflictException('Page number must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new ConflictException('Limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = queryDto.sortBy || 'transactionDate';
    const sortOrder = queryDto.sortOrder || 'desc';

    // Validate sort parameters
    const allowedSortFields = [
      'type',
      'amount',
      'currency',
      'transactionDate',
      'createdAt',
      'updatedAt',
    ];
    if (!allowedSortFields.includes(sortBy)) {
      throw new ConflictException(
        `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`,
      );
    }

    const allowedSortOrders = ['asc', 'desc'];
    if (!allowedSortOrders.includes(sortOrder)) {
      throw new ConflictException(
        `Invalid sort order. Allowed orders: ${allowedSortOrders.join(', ')}`,
      );
    }

    // Get total count for pagination
    const total = await this.prisma.transaction.count({ where });

    // Get filtered and paginated transactions
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        userTransactions: {
          include: {
            user: true,
          },
        },
        transactionCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    const transactionResponses = transactions.map(
      (transaction) => new TransactionResponseDto(transaction),
    );

    return new PaginatedTransactionsResponseDto(
      transactionResponses,
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, isDeleted: false },
      include: {
        userTransactions: {
          include: {
            user: true,
          },
        },
        transactionCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return new TransactionResponseDto(transaction);
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    // Check if transaction exists
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Check if user exists (if updating userId)
    if (updateTransactionDto.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: updateTransactionDto.userId, isDeleted: false },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Check if categories exist (if updating categoryIds)
    if (updateTransactionDto.categoryIds) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: updateTransactionDto.categoryIds } },
      });

      if (categories.length !== updateTransactionDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (updateTransactionDto.type !== undefined) {
      updateData.type = updateTransactionDto.type;
    }
    if (updateTransactionDto.amount !== undefined) {
      updateData.amount = updateTransactionDto.amount;
    }
    if (updateTransactionDto.currency !== undefined) {
      updateData.currency = updateTransactionDto.currency.toUpperCase();
    }
    if (updateTransactionDto.transactionDate !== undefined) {
      updateData.transactionDate = new Date(
        updateTransactionDto.transactionDate,
      );
    }
    if (updateTransactionDto.description !== undefined) {
      updateData.description = updateTransactionDto.description;
    }

    // Update user association if needed
    if (updateTransactionDto.userId) {
      updateData.userTransactions = {
        deleteMany: {},
        create: {
          userId: updateTransactionDto.userId,
        },
      };
    }

    // Update category associations if needed
    if (updateTransactionDto.categoryIds) {
      updateData.transactionCategory = {
        deleteMany: {},
        create: updateTransactionDto.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        userTransactions: {
          include: {
            user: true,
          },
        },
        transactionCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return new TransactionResponseDto(updatedTransaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Soft delete
    await this.prisma.transaction.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
