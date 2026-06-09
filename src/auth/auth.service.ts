import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Role, TenantStatus } from 'src/common/enums/index.enum';
import {
  BadRequestException,
  DuplicateResourceException,
  InvalidCredentialsException,
  UnauthorizedAccessException,
} from 'src/common/exceptions/domain.exceptions';
import { hashPassword } from 'src/common/utils/index.utils';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TokenService } from 'src/token/token.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { LoginDto, SignupDto } from './dto/index.dto';

export interface JwtPayload {
  sub: string;
  tid: string;
  schema: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly publicDataSource: DataSource,
    private readonly tenantProvisionService: TenantProvisioningService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(signupDto: SignupDto) {
    const schema = signupDto.slug;

    const existing = await this.publicDataSource
      .getRepository(Tenant)
      .findOne({ where: { slug: schema } });

    if (existing) {
      throw new DuplicateResourceException('TENANT_SLUG', schema);
    }

    const passwordHash = await hashPassword(signupDto.tenantOwnerPassword);
    let tenant: Tenant;

    try {
      tenant = await this.publicDataSource.getRepository(Tenant).save({
        name: signupDto.name,
        slug: signupDto.slug,
        tenantOwnerEmail: signupDto.tenantOwnerEmail,
        schemaName: schema,
        status: TenantStatus.ACTIVE,
      });

      await this.publicDataSource.query(
        `CREATE SCHEMA IF NOT EXISTS "${schema}"`,
      );
      const tenantDb = await this.tenantProvisionService.provision(schema);

      await tenantDb.getRepository(User).save({
        email: signupDto.tenantOwnerEmail,
        displayName: signupDto.name,
        passwordHash,
        role: Role.OWNER,
        activatedAt: new Date(),
      });
    } catch (error) {
      //  rollback
      await this.publicDataSource.query(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      if (tenant?.id) {
        await this.publicDataSource.getRepository(Tenant).delete(tenant.id);
      }
      // disconnect and remove tenant connection from cache
      await this.tenantProvisionService.deleteConnection(schema);
      throw error;
    }
  }

  async login(tenant: Tenant, loginDto: LoginDto) {
    if (!tenant) throw new BadRequestException('Tenant context is required.');

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedAccessException('Workspace is not active');
    }

    const schemaName = tenant.schemaName || `tenant_${tenant.slug}`;
    const tenantDb =
      await this.tenantProvisionService.getDataSource(schemaName);

    const result = await tenantDb.query(
      `SELECT id, email, password_hash,role,activated_at,last_login_date FROM "${schemaName}".users
      WHERE email = $1
      LIMIT 1`,
      [loginDto.email],
    );
    const user = result[0];

    if (!user) throw new InvalidCredentialsException();

    if (!user.activated_at) {
      throw new UnauthorizedAccessException(
        'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await argon2.verify(
      user.password_hash,
      loginDto.password,
    );
    if (!isPasswordValid) throw new InvalidCredentialsException();

    user.password_hash = undefined;

    tenantDb
      .query(
        `UPDATE "${schemaName}".users SET last_login_at = NOW() WHERE id = $1`,
        [user.id],
      )
      .catch((err) =>
        console.error('Failed to update last login timestamp', err),
      );

    user.tenant = schemaName;

    const { accessToken, refreshToken } = await this.tokenService.issueToken(
      user.id,
      user.role,
      schemaName,
    );

    return { user, accessToken, refreshToken };
  }
}
