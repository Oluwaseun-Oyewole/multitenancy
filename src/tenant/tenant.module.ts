import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantInvitation } from './entities/tenant.invitation';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantInvitation])],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
