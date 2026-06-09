import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from 'src/common/enums/index.enum';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  content: string;

  @IsEnum(FeedbackPriority)
  @IsOptional()
  priority: FeedbackPriority;

  @IsEnum(FeedbackType)
  @IsOptional()
  type: FeedbackType;

  @IsEnum(FeedbackStatus)
  @IsOptional()
  status: FeedbackStatus;

  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  feedbackId: string;

  @IsString()
  @IsOptional()
  changelogId?: string;

  @IsNumber()
  @IsOptional()
  voteCount: number;
}

export class CreateFeedbackCommentDto {
  @IsString()
  comment: string;
}
