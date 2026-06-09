import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from 'src/common/enums/index.enum';

export class CreateFeedbackDto {
  @IsString()
  content: string;

  @IsEnum(FeedbackPriority)
  priority: FeedbackPriority;

  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @IsString()
  productId: string;

  @IsNumber()
  @IsOptional()
  voteCount: number;
}
