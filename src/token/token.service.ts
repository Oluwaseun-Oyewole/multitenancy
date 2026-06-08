import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashToken } from 'src/common/utils/index.utils';
import { REDIS_KEYS, REDIS_TTL } from 'src/redis/redis.constant';
import { RedisService } from 'src/redis/redis.service';

export interface TokenPayload {
  sub: string;
  role: string;
  schemaName: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async issueToken(userId: string, role: string, schemaName: string) {
    const { accessToken, refreshToken } = await this.createToken(
      userId,
      role,
      schemaName,
    );
    return { accessToken, refreshToken };
  }

  private async createToken(userId: string, role: string, schemaName: string) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.sign(
        {
          sub: userId,
          role,
          schemaName,
        } satisfies TokenPayload,
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES'),
        },
      ),

      await this.jwtService.sign(
        {
          sub: userId,
          role,
          schemaName,
        } satisfies TokenPayload,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
          expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);
    const tokenHash = hashToken(refreshToken);

    const payload = {
      tokenHash,
      createdAt: new Date().toISOString(),
    };

    await Promise.all([
      this.redisService.set(
        REDIS_KEYS.REFRESH_TOKEN(userId),
        payload,
        REDIS_TTL.REFRESH_TOKEN,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
