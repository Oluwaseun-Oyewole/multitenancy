import { Changelog } from 'src/changelogs/entities/changelog.entity';
import {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

@Entity('feedback')
export class Feedback extends BaseEntity {
  @Column({ nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    nullable: true,
  })
  status: FeedbackStatus;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    name: 'priority',
    nullable: true,
  })
  priority: FeedbackPriority;

  @Column({
    type: 'enum',
    enum: FeedbackType,
    name: 'feedback_type',
    nullable: true,
  })
  type: FeedbackType;

  @Column({ default: 0, nullable: true })
  voteCount: number;

  @ManyToOne(() => Product, (product) => product.feedbacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Changelog, (changeLog) => changeLog.feedbacks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'change_log_id' })
  changeLogs: Changelog;

  // for read convenience
  @RelationId((feedback: Feedback) => feedback.product)
  productId: string;

  @RelationId((feedback: Feedback) => feedback.changeLogs)
  changelogId: string;

  @Column({ name: 'user_id' })
  userId: string;
}
