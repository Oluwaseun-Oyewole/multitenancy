import {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from 'src/common/enums/index.enum';
import { BaseEntity } from 'src/common/utils/base.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('feedback')
export class Feedback extends BaseEntity {
  @Column({ nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  status: FeedbackStatus;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    default: FeedbackPriority.LOW,
    name: 'priority',
  })
  priority: FeedbackPriority;

  @Column({
    type: 'enum',
    enum: FeedbackType,
    default: FeedbackType.BUG,
    name: 'feedback_type',
  })
  type: FeedbackType;

  @Column({ default: 0 })
  voteCount: number;

  @ManyToOne(() => Product, (product) => product.feedbacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;
}
