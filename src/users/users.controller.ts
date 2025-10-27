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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpgradeUserDto,
  UserResponseDto,
  GetUsersQueryDto,
  PaginatedUsersResponseDto,
} from './dto';
import { JwtAuthGuard, OwnershipGuard, AdminGuard } from '../auth/guards';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get all users with optional filtering and pagination',
    description:
      'Get list of all users. Only admin users (level 99) can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll(
    @Query() queryDto: GetUsersQueryDto,
  ): Promise<UserResponseDto[] | PaginatedUsersResponseDto> {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    // @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/upgrade')
  @ApiOperation({
    summary: 'Upgrade user level',
    description:
      'Upgrade a user to a higher level. Only admin users (level 99) can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiBody({ type: UpgradeUserDto })
  @ApiResponse({
    status: 200,
    description: 'User level upgraded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - validation error or level not higher than current',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async upgradeUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() upgradeUserDto: UpgradeUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.upgradeUser(id, upgradeUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    // @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.usersService.remove(id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(currentUser.id);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Current user profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(currentUser.id, updateUserDto);
  }
}
