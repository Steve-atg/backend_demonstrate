import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  GetUsersQueryDto,
  PaginatedUsersResponseDto,
} from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(
    queryDto?: GetUsersQueryDto,
  ): Promise<UserResponseDto[] | PaginatedUsersResponseDto> {
    // If no query parameters, return simple list
    if (!queryDto) {
      const users = await this.prisma.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user) => new UserResponseDto(user));
    }

    // Build where clause
    const where: any = { isDeleted: false };

    // Username filter (exact match)
    if (queryDto.username) {
      where.username = {
        contains: queryDto.username,
        mode: 'insensitive',
      };
    }

    // Email filter (partial match)
    if (queryDto.email) {
      where.email = {
        contains: queryDto.email,
        mode: 'insensitive',
      };
    }

    // Gender filter
    if (queryDto.gender) {
      where.gender = queryDto.gender;
    }

    // User level filters
    if (queryDto.userLevel) {
      where.userLevel = queryDto.userLevel;
    } else {
      // Range filters for user level
      if (queryDto.minUserLevel || queryDto.maxUserLevel) {
        where.userLevel = {};
        if (queryDto.minUserLevel) {
          where.userLevel.gte = queryDto.minUserLevel;
        }
        if (queryDto.maxUserLevel) {
          where.userLevel.lte = queryDto.maxUserLevel;
        }
      }
    }

    // Date filters for creation
    if (queryDto.createdAfter || queryDto.createdBefore) {
      where.createdAt = {};
      if (queryDto.createdAfter) {
        where.createdAt.gte = new Date(queryDto.createdAfter);
      }
      if (queryDto.createdBefore) {
        where.createdAt.lte = new Date(queryDto.createdBefore);
      }
    }

    // Date filters for birth date
    if (queryDto.bornAfter || queryDto.bornBefore) {
      where.dateOfBirth = {};
      if (queryDto.bornAfter) {
        where.dateOfBirth.gte = new Date(queryDto.bornAfter);
      }
      if (queryDto.bornBefore) {
        where.dateOfBirth.lte = new Date(queryDto.bornBefore);
      }
    }

    // Search term (searches in username and email)
    if (queryDto.search) {
      where.OR = [
        {
          username: {
            contains: queryDto.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: queryDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    // Get total count for pagination
    const total = await this.prisma.user.count({ where });

    // Get filtered and paginated users
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const userResponses = users.map((user) => new UserResponseDto(user));

    return new PaginatedUsersResponseDto(userResponses, total, page, limit);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being updated, check if new email is already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password if it's being updated
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new UserResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
