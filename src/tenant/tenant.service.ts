import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAllTenants() {
    return this.dataSource.getRepository(Tenant).find();
  }

  async getTenantById(id: string) {
    return this.dataSource.getRepository(Tenant).findOne({ where: { id } });
  }
}
