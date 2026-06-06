import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { CacheWrapper } from 'src/common/cache/index.cache';
import { User } from 'src/user/entity/user.entity';
import { DataSource } from 'typeorm';

const TENANT_ENTITIES = [User];

@Injectable()
export class TenantProvisioningService {
  private readonly cache: CacheWrapper<DataSource> = new CacheWrapper();

  constructor(
    @InjectDataSource() private readonly rootDs: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async provision(schemaName: string): Promise<DataSource> {
    const ds = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      schema: schemaName,
      entities: TENANT_ENTITIES,
      synchronize: false,
      poolSize: 5,
      extra: {
        idleTimeoutMillis: 60_000,
        connectionTimeoutMillis: 5_000,
      },
      // migrations: [path.join(__dirname, 'migrations/tenant/*.js')],
    });

    await ds.initialize();
    await ds.runMigrations();

    this.cache.set(schemaName, ds);
    return ds;
  }

  async getDataSource(schemaName: string): Promise<DataSource> {
    if (this.cache.has(schemaName)) return this.cache.get(schemaName);
    return this.provision(schemaName);
  }
  async deleteConnection(schemaName: string) {
    const connection = this.cache.get(schemaName);
    if (connection?.isInitialized) {
      await connection.destroy();
      this.cache.delete(schemaName);
    }
  }
}
