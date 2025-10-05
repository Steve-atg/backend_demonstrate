import { Exclude } from 'class-transformer';
import { Gender } from '@prisma/client';

export class UserResponseDto {
  id: string;
  username: string;
  userLevel: number;
  email: string;
  avatar?: string;
  gender: Gender;
  dateOfBirth?: Date;
  createdAt: Date;
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
