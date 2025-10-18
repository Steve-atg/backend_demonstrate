import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  username: string;
  tokenId: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: RefreshTokenPayload) {
    const refreshToken = req.body?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Hash the refresh token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find the refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            userLevel: true,
            avatar: true,
            gender: true,
            dateOfBirth: true,
            createdAt: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.user.isDeleted) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (storedToken.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      user: storedToken.user,
      tokenId: storedToken.id,
    };
  }
}
