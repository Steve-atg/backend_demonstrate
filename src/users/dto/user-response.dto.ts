import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The user level/rank',
    example: 1,
  })
  userLevel: number;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'URL to the user avatar image',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    example: Gender.M,
  })
  gender: Gender;

  @ApiPropertyOptional({
    description: 'The date of birth of the user',
    example: '1990-01-01T00:00:00.000Z',
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'When the user was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  isDeleted: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
