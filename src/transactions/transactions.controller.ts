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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() queryDto: GetTransactionsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto[] | PaginatedTransactionsResponseDto> {
    const isAdmin = currentUser.userLevel >= ADMIN_LEVEL;
    return this.transactionsService.findAll(queryDto, currentUser.id, isAdmin);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.transactionsService.remove(id);
  }

  @Get('me/transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(
    @Query() queryDto: GetTransactionsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto[] | PaginatedTransactionsResponseDto> {
    // Force filter to only show current user's transactions
    return this.transactionsService.findAll(queryDto, currentUser.id, false);
  }

  @Post('me/transactions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createMyTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    // Force the transaction to be created for the current user
    const userTransactionDto = {
      ...createTransactionDto,
      userId: currentUser.id,
    };
    return this.transactionsService.create(
      userTransactionDto,
      currentUser.id,
      false,
    );
  }
}
