import { ApiProperty } from '@nestjs/swagger';

class UserDataDto {
  @ApiProperty({
    description: 'User ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User level',
    example: 1,
  })
  userLevel: number;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'User gender',
    example: 'M',
    enum: ['M', 'F', 'OTHER'],
  })
  gender: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-15T00:00:00.000Z',
    required: false,
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserDataDto,
  })
  user: UserDataDto;
}
