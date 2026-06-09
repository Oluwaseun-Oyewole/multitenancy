import { ChangelogStatus, ChangelogType } from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('change-logs')
export class Changelog extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.changeLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Feedback, (feedback) => feedback.changeLogs)
  feedbacks: Feedback[];

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ChangelogType, default: ChangelogType.BUGFIX })
  type: ChangelogType;

  @Column({
    type: 'enum',
    enum: ChangelogStatus,
    default: ChangelogStatus.DRAFT,
  })
  status: ChangelogStatus;

  @Column({ nullable: true })
  version: string;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;
}
