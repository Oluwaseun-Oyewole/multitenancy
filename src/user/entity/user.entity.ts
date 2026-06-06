import { Exclude } from 'class-transformer';
import { Role } from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
    name: 'role',
  })
  role: Role;

  @Exclude()
  @Column({ select: false, name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'timestamp', name: 'activated_at', nullable: true })
  activatedAt: Date | null;

  @Column({ type: 'timestamp', name: 'password_changed_at', nullable: true })
  passwordChangedAt: Date | null;

  @Column({ type: 'timestamp', name: 'last_login_date', nullable: true })
  lastLoginDate: Date | null;
}
