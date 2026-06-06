import { PlanType, TenantStatus } from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true, name: 'tenant_owner_email' })
  tenantOwnerEmail: string;

  @Column({ unique: true, name: 'schema_name' })
  schemaName: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PENDING,
    name: 'status',
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.FREE,
    name: 'plan',
  })
  plan: PlanType;
}
