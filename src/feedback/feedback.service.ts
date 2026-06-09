import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/exceptions/domain.exceptions';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
import { Product } from 'src/products/entities/product.entity';
import { CreateFeedbackDto } from './dto/index.dto';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly tenantProvisionService: TenantProvisioningService,
  ) {}

  async createFeedback(
    schema: string,
    userId: string,
    feedbackData: CreateFeedbackDto,
  ) {
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);
    const productExist = await tenantDataSource.getRepository(Product).findOne({
      where: { id: feedbackData.productId },
    });
    if (!productExist) {
      throw new ResourceNotFoundException('PRODUCT', feedbackData.productId);
    }
    const feedbackRepo = tenantDataSource.getRepository(Feedback);
    const feedback = feedbackRepo.create({
      ...feedbackData,
      userId,
    });
    return feedbackRepo.save(feedback);
  }

  async getFeedbacksByProductId(schema: string, productId: string) {
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);
    const feedbackRepo = tenantDataSource.getRepository(Feedback);
    return feedbackRepo.find({ where: { productId } });
  }

  async updateProductFeedback(
    schema: string,
    feedbackId: string,
    feedbackData: Partial<CreateFeedbackDto>,
  ) {
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);
    const feedbackRepo = tenantDataSource.getRepository(Feedback);
    const feedback = await feedbackRepo.findOne({ where: { id: feedbackId } });
    if (!feedback) {
      throw new ResourceNotFoundException('FEEDBACK', feedbackId);
    }
    const product = await tenantDataSource.getRepository(Product).findOne({
      where: { id: feedbackData.productId },
    });
    if (!product) {
      throw new ResourceNotFoundException('PRODUCT', feedbackData.productId);
    }
    feedbackRepo.update(feedbackId, feedbackData);
    return await feedbackRepo.findOne({ where: { id: feedbackId } });
  }
}
