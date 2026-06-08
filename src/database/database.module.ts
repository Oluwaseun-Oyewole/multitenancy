import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TenantInvitation } from 'src/tenant/entities/tenant.invitation';
import { TenantProvisioningService } from './tenant-datasource.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        schema: 'public', // ← root DS only ever touches public schema
        synchronize: false,
        entities: [Tenant, TenantInvitation], // ← ONLY public-schema entities
        migrations: ['dist/database/migrations/public/*.js'],
        migrationsRun: true,
        extra: {
          idleTimeoutMillis: 60_000,
          connectionTimeoutMillis: 5_000,
        },
      }),
    }),
    TypeOrmModule.forFeature([Tenant, TenantInvitation]),
  ],
  providers: [TenantProvisioningService],
  exports: [TenantProvisioningService, TypeOrmModule],
})
export class DatabaseModule {}
