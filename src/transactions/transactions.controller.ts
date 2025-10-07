import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  GetTransactionsQueryDto,
  PaginatedTransactionsResponseDto,
} from './dto';

@Controller('transactions')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(
    @Query() queryDto: GetTransactionsQueryDto,
  ): Promise<TransactionResponseDto[] | PaginatedTransactionsResponseDto> {
    return this.transactionsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.transactionsService.remove(id);
  }
}
