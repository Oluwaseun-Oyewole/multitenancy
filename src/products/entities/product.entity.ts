import { BaseEntity } from 'src/common/utils/base.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true, name: 'tenant_schema' })
  tenantSchema: string;

  @OneToMany(() => Feedback, (feedback) => feedback.product)
  feedbacks: Feedback[];
}
