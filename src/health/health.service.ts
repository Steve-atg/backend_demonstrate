import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    try {
      await this.prisma.user.count(); // Simple query to test connection
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
