import { Injectable } from '@nestjs/common';
import { Changelog } from 'src/changelogs/entities/changelog.entity';
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
    feedbackDto: CreateFeedbackDto,
  ) {
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);

    const productRepo = tenantDataSource.getRepository(Product);
    const feedbackRepo = tenantDataSource.getRepository(Feedback);
    const changeLogRepo = tenantDataSource.getRepository(Changelog);
    const productExist = await productRepo.findOne({
      where: { id: feedbackDto.productId },
    });

    if (!productExist) {
      throw new ResourceNotFoundException('PRODUCT', feedbackDto.productId);
    }

    let changeLog: Changelog | null;

    if (feedbackDto.changelogId) {
      changeLog = await changeLogRepo.findOne({
        where: { id: feedbackDto.changelogId },
      });
      if (!changeLog) {
        throw new ResourceNotFoundException(
          'CHANGELOG',
          feedbackDto.changelogId,
        );
      }
    }

    const feedback = feedbackRepo.create({
      ...feedbackDto,
      userId,
      product: productExist,
      changeLogs: changeLog ?? undefined,
    });
    const feedbackData = await feedbackRepo.save(feedback);
    return { ...feedbackData };
  }

  async updateFeedback(
    schema: string,
    feedbackDto: Partial<CreateFeedbackDto>,
  ) {
    const { feedbackId } = feedbackDto;
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);
    const feedbackRepo = tenantDataSource.getRepository(Feedback);

    await this.getFeedbackById(schema, feedbackId);
    const product = await tenantDataSource.getRepository(Product).findOne({
      where: { id: feedbackDto.productId },
    });
    if (!product) {
      throw new ResourceNotFoundException('PRODUCT', feedbackDto.productId);
    }
    feedbackRepo.update(feedbackId, feedbackDto);
    return await feedbackRepo.findOne({ where: { id: feedbackId } });
  }

  async getFeedbackById(schema: string, feedbackId: string) {
    const tenantDataSource =
      await this.tenantProvisionService.getDataSource(schema);
    const feedBackRepo = tenantDataSource.getRepository(Feedback);

    const feedback = await feedBackRepo.findOne({
      where: {
        id: feedbackId,
      },
    });
    if (!feedback) {
      throw new ResourceNotFoundException('FEEDBACK', feedbackId);
    }
    return feedback;
  }
}
