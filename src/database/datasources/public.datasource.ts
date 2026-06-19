import 'dotenv/config';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TenantInvitation } from 'src/tenant/entities/tenant.invitation';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'public',
  synchronize: false,
  entities: [Tenant, TenantInvitation],
  migrations: ['src/database/migrations/public/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  },
});

export default AppDataSource;
