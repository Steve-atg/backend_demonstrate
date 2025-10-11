export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    userLevel: number;
    avatar?: string;
    gender: string;
    dateOfBirth?: Date;
    createdAt: Date;
  };
}
