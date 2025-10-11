import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';

export const ADMIN_LEVEL = 99;

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin users (level 99) can access everything
    if (user.userLevel >= ADMIN_LEVEL) {
      return true;
    }

    // Get the resource ID from the route parameters
    const resourceId = request.params.id;
    if (!resourceId) {
      throw new ForbiddenException('Resource ID required');
    }

    // Determine the resource type based on the controller route
    const resourceType = this.getResourceType(request.route?.path);

    switch (resourceType) {
      case 'user':
        return this.checkUserOwnership(user.id, resourceId);
      case 'transaction':
        return this.checkTransactionOwnership(user.id, resourceId);
      default:
        throw new ForbiddenException('Unknown resource type');
    }
  }

  private getResourceType(routePath: string): string {
    if (routePath?.includes('/users/')) {
      return 'user';
    }
    if (routePath?.includes('/transactions/')) {
      return 'transaction';
    }
    return 'unknown';
  }

  private async checkUserOwnership(
    userId: string,
    resourceId: string,
  ): Promise<boolean> {
    // Users can only edit their own profile
    if (userId === resourceId) {
      return true;
    }

    throw new ForbiddenException('You can only edit your own profile');
  }

  private async checkTransactionOwnership(
    userId: string,
    transactionId: string,
  ): Promise<boolean> {
    // Check if the transaction belongs to the user
    const userTransaction = await this.prisma.userTransaction.findFirst({
      where: {
        userId: userId,
        transactionId: transactionId,
      },
    });

    if (!userTransaction) {
      // Check if transaction exists to give proper error message
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      throw new ForbiddenException('You can only edit your own transactions');
    }

    return true;
  }
}
