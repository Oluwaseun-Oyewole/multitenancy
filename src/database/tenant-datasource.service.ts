import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { CacheWrapper } from 'src/common/cache/index.cache';
import { User } from 'src/user/entity/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantProvisioningService {
  private readonly cache: CacheWrapper<DataSource> = new CacheWrapper();

  constructor(private readonly configService: ConfigService) {}

  async provision(schemaName: string) {
    const ds = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      schema: schemaName,
      entities: [User],
      synchronize: false,
      poolSize: 5,
      extra: {
        idleTimeoutMillis: 60_000,
        connectionTimeoutMillis: 5_000,
      },
      migrations: [path.join(__dirname, 'migrations/tenant/*.js')],
    });

    await ds.initialize();
    await ds.runMigrations();

    this.cache.set(schemaName, ds);
    return ds;
  }

  async getDataSource(schemaName: string) {
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
