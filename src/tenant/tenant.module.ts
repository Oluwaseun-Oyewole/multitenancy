import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantInvitation } from './entities/tenant.invitation';
import { TenantInvitationCleanupService } from './tenant-invitation-cleanup.service';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantInvitation])],
  controllers: [TenantController],
  providers: [TenantService, TenantInvitationCleanupService],
})
export class TenantModule {}
