import { config } from 'dotenv';
import { Changelog } from 'src/changelogs/entities/changelog.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.TENANT_SCHEMA ?? 'tenant_acme',
  entities: [User, Product, Feedback, Changelog],
  migrations: ['src/database/migrations/tenant/*.ts'],
});
