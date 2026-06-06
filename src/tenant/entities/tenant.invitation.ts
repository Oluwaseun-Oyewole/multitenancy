import { Role } from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'invitations' })
export class TenantInvitation extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  tenantSchema: string;

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

  @Column()
  invitedByUserId: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date;
}
