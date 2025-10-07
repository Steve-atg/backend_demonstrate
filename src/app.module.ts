import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [UsersModule, TransactionsModule],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthService, PrismaService],
})
export class AppModule {}
