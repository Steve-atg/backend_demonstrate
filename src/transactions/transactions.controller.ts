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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  GetTransactionsQueryDto,
  PaginatedTransactionsResponseDto,
} from './dto';
import { JwtAuthGuard, OwnershipGuard } from '../auth/guards';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators';
import { ADMIN_LEVEL } from '../auth/guards/ownership.guard';

@ApiTags('transactions')
@Controller('transactions')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    const isAdmin = currentUser.userLevel >= ADMIN_LEVEL;
    return this.transactionsService.create(
      createTransactionDto,
      currentUser.id,
      isAdmin,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiOperation({
    summary: 'Get all transactions with filtering and pagination',
  })
  @ApiQuery({ type: GetTransactionsQueryDto })
  @ApiResponse({
    status: 200,
    description:
      'Returns paginated list of transactions or array of transactions',
    type: PaginatedTransactionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @Query() queryDto: GetTransactionsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto[] | PaginatedTransactionsResponseDto> {
    const isAdmin = currentUser.userLevel >= ADMIN_LEVEL;
    return this.transactionsService.findAll(queryDto, currentUser.id, isAdmin);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    // @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    // @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.transactionsService.remove(id);
  }
}
