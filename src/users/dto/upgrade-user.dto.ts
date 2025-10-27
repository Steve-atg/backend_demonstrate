import { IsInt, IsPositive, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeUserDto {
  @ApiProperty({
    description: 'The new user level to upgrade to',
    example: 5,
    minimum: 1,
    maximum: 99,
  })
  @IsInt({ message: 'User level must be an integer' })
  @IsPositive({ message: 'User level must be positive' })
  @Min(1, { message: 'User level must be at least 1' })
  @Max(99, { message: 'User level cannot exceed 99 (admin level)' })
  userLevel: number;
}
