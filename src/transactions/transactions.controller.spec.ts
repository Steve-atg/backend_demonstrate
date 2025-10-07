import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionType } from '@prisma/client';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createTransactionDto = {
        type: TransactionType.SPEND,
        amount: 100.5,
        currency: 'USD',
        transactionDate: '2024-01-01T12:00:00Z',
        description: 'Test transaction',
        userId: 'user-id-123',
      };

      const expectedResult = {
        id: 'transaction-id-123',
        ...createTransactionDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTransactionDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createTransactionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = [
        {
          id: 'transaction-id-123',
          type: TransactionType.SPEND,
          amount: 100.5,
          currency: 'USD',
          transactionDate: new Date(),
          description: 'Test transaction',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTransactionsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      const transactionId = 'transaction-id-123';
      const expectedResult = {
        id: transactionId,
        type: TransactionType.SPEND,
        amount: 100.5,
        currency: 'USD',
        transactionDate: new Date(),
        description: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(transactionId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const transactionId = 'transaction-id-123';
      const updateTransactionDto = {
        amount: 200.5,
        description: 'Updated transaction',
      };

      const expectedResult = {
        id: transactionId,
        type: TransactionType.SPEND,
        amount: 200.5,
        currency: 'USD',
        transactionDate: new Date(),
        description: 'Updated transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      const transactionId = 'transaction-id-123';

      mockTransactionsService.remove.mockResolvedValue(undefined);

      await controller.remove(transactionId);

      expect(service.remove).toHaveBeenCalledWith(transactionId);
    });
  });
});
