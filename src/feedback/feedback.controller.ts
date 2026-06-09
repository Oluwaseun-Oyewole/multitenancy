import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import {
  CurrentTenant,
  CurrentUser,
} from 'src/common/decorators/tenant.decorator';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TokenPayload } from 'src/token/token.service';
import { CreateFeedbackDto } from './dto/index.dto';
import { FeedbackService } from './feedback.service';

@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: TokenPayload,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(
      tenant.schemaName,
      user.sub,
      feedbackData,
    );
  }

  @Put()
  async updateFeedback(
    @CurrentTenant() tenant: Tenant,
    @Body() feedbackDto: Partial<CreateFeedbackDto>,
  ) {
    return this.feedbackService.updateProductFeedback(
      tenant.schemaName,
      feedbackDto,
    );
  }
}
