import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationStatus } from 'src/common/enums/index.enum';
import {
  BadRequestException,
  DuplicateResourceException,
  ResourceNotFoundException,
} from 'src/common/exceptions/domain.exceptions';
import { hashPassword } from 'src/common/utils/index.utils';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  RevokeInvitationDto,
} from './dto/index.dto';
import { TenantInvitation } from './entities/tenant.invitation';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantInvitation)
    private readonly tenantInvitationRepository: Repository<TenantInvitation>,
    private readonly tenantProvisionService: TenantProvisioningService,
  ) {}

  async inviteUserToTenant(
    schema: string,
    invitedUserId: string,
    dto: CreateInvitationDto,
  ) {
    const existing = await this.tenantInvitationRepository.findOne({
      where: {
        email: dto.email,
        tenantSchema: schema,
        status: InvitationStatus.PENDING,
      },
    });
    if (existing) {
      throw new DuplicateResourceException('INVITATION', dto.email);
    }
    const token = uuid.v4();

    const tenantDb = await this.tenantProvisionService.getDataSource(schema);
    const userRepository = tenantDb.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists in tenant');
    }

    const invitation = this.tenantInvitationRepository.create({
      tenantSchema: schema,
      email: dto.email,
      role: dto.role,
      token,
      invitedByUserId: invitedUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const savedInvitation =
      await this.tenantInvitationRepository.save(invitation);
    // send email with token to invited user
    return savedInvitation;
  }
  async acceptTenantInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.tenantInvitationRepository.findOne({
      where: { token: dto.token, status: InvitationStatus.PENDING },
    });
    if (!invitation) {
      throw new ResourceNotFoundException('INVITATION', dto.token);
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }
    if (invitation.expiresAt < new Date()) {
      await this.tenantInvitationRepository.update(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      throw new BadRequestException('Invitation has expired');
    }

    const schema = invitation.tenantSchema;
    const tenantDb = await this.tenantProvisionService.getDataSource(schema);

    const userRepository = tenantDb.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists in tenant');
    }

    const passwordHash = await hashPassword(dto.password);

    const savedUser = await userRepository.save({
      email: invitation.email,
      role: invitation.role,
      passwordHash,
      displayName: dto.displayName,
      activatedAt: new Date(),
    });

    await this.tenantInvitationRepository.update(invitation.id, {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    });
    return savedUser;
    // send notification email to inviter about acceptance
  }

  async revokeInvitation(dto: RevokeInvitationDto) {
    const invitation = await this.tenantInvitationRepository.findOne({
      where: { email: dto.email, status: InvitationStatus.PENDING },
    });
    if (!invitation) {
      throw new ResourceNotFoundException('INVITATION', dto.email);
    }
    await this.tenantInvitationRepository.update(invitation.id, {
      status: InvitationStatus.REVOKED,
      revokedAt: new Date(),
    });
    // send notification email to invited user about revocation
  }
}
