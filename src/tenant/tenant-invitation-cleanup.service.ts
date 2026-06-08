import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationStatus } from 'src/common/enums/index.enum';
import { Repository } from 'typeorm';
import { TenantInvitation } from './entities/tenant.invitation';

@Injectable()
export class TenantInvitationCleanupService {
  private readonly logger = new Logger(TenantInvitationCleanupService.name);
  constructor(
    @InjectRepository(TenantInvitation)
    private readonly tenantInvitationRepository: Repository<TenantInvitation>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireStaleInvitations() {
    const now = new Date();
    const result = await this.tenantInvitationRepository
      .createQueryBuilder()
      .update(TenantInvitation)
      .set({ status: InvitationStatus.EXPIRED })
      .where('status = :status', { status: InvitationStatus.PENDING })
      .andWhere('expiresAt < :now', { now })
      .execute();
    this.logger.log(`Expired ${result.affected} tenant invitations`);
  }
}
