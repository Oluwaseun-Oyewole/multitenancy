import { InvitationStatus, Role } from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'invitations' })
export class TenantInvitation extends BaseEntity {
  @Column({ name: 'tenant_schema' })
  tenantSchema: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
  })
  role: Role;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'invited_by_user_id' })
  invitedByUserId: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt: Date;
}
