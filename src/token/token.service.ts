import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashToken } from 'src/common/utils/index.utils';
import { REDIS_KEYS, REDIS_TTL } from 'src/redis/redis.constant';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  sub: string;
  role: string;
  tid: string;
  jti: string;
  schemaName: string;
  family: string;
}

interface RefreshTokenRecord {
  tokenHash: string;
  createdAt: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async issueToken(
    userId: string,
    role: string,
    schemaName: string,
    tenantId: string,
  ) {
    const { accessToken, refreshToken } = await this.createToken(
      userId,
      tenantId,
      role,
      schemaName,
    );
    return { accessToken, refreshToken };
  }

  private async createToken(
    userId: string,
    tenantId: string,
    role: string,
    schemaName: string,
  ) {
    const jti = uuidv4();
    const family = uuidv4();

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.sign(
        {
          sub: userId,
          jti,
          family,
          role,
          schemaName,
          tid: tenantId,
        } satisfies TokenPayload,
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES'),
        },
      ),

      await this.jwtService.sign(
        {
          sub: userId,
          jti,
          family,
          role,
          schemaName,
          tid: tenantId,
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
        REDIS_KEYS.REFRESH_TOKEN(userId, family),
        payload,
        REDIS_TTL.REFRESH_TOKEN,
      ),
      this.redisService.sadd(REDIS_KEYS.USER_TOKEN_FAMILIES(userId), family),
    ]);

    return {
      accessToken,
      refreshToken: `${family}:${refreshToken}`,
    };
  }

  async verifyRefreshToken(
    userId: string,
    refreshToken: string,
    family: string,
  ): Promise<boolean> {
    const key = REDIS_KEYS.REFRESH_TOKEN(userId, family);
    const record = await this.redisService.get<RefreshTokenRecord>(key);

    if (!record) return false;
    const tokenHash = hashToken(refreshToken);
    return tokenHash === record.tokenHash;
  }

  async revokeTokenFamily(userId: string, family: string): Promise<void> {
    await Promise.all([
      this.redisService.del(REDIS_KEYS.REFRESH_TOKEN(userId, family)),
      this.redisService.srem(REDIS_KEYS.USER_TOKEN_FAMILIES(userId), family),
    ]);
  }

  async revokeAllFamilies(userId: string): Promise<void> {
    const families = await this.redisService.smembers(
      REDIS_KEYS.USER_TOKEN_FAMILIES(userId),
    );
    if (families.length) {
      await this.redisService.del(
        ...families.map((f) => REDIS_KEYS.REFRESH_TOKEN(userId, f)),
        REDIS_KEYS.USER_TOKEN_FAMILIES(userId),
      );
    }
  }
  async revokeFamilyAndSession(
    userId: string,
    sessionId: string,
    family: string,
  ): Promise<void> {
    await Promise.all([
      this.redisService.del(REDIS_KEYS.REFRESH_TOKEN(userId, family)),
      this.redisService.del(REDIS_KEYS.SESSION(sessionId)),
      this.redisService.srem(REDIS_KEYS.USER_SESSIONS(userId), sessionId),
      this.redisService.srem(REDIS_KEYS.USER_TOKEN_FAMILIES(userId), family),
    ]);
  }
}
