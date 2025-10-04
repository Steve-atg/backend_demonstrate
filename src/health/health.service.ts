import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  prisma: any;
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
