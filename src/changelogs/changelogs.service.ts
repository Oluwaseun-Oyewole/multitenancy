import { Injectable } from '@nestjs/common';
import { IPaginate } from 'src/common/dto/success.response.dto';
import { ResourceNotFoundException } from 'src/common/exceptions/domain.exceptions';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
import { Product } from 'src/products/entities/product.entity';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { Changelog } from './entities/changelog.entity';

@Injectable()
export class ChangelogsService {
  constructor(
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  async createChangeLogs(schema: string, dto: CreateChangelogDto) {
    const tenantDataSource =
      await this.tenantProvisioningService.getDataSource(schema);
    const changeLogDb = tenantDataSource.getRepository(Changelog);
    return await changeLogDb.save(changeLogDb.create(dto));
  }

  async getChangeLogByProductId(
    schema: string,
    productId: string,
    page: number,
    limit: number,
  ): Promise<IPaginate<Changelog[]>> {
    page = Math.max(1, page);
    limit = Math.min(200, Math.max(1, limit));
    const offset = (page - 1) * limit;

    const tenantDataSource =
      await this.tenantProvisioningService.getDataSource(schema);
    const changeLogRepo = tenantDataSource.getRepository(Changelog);
    const productRepo = tenantDataSource.getRepository(Product);

    const product = await productRepo.findOne({ where: { id: productId } });

    if (!product) {
      throw new ResourceNotFoundException('PRODUCT', productId);
    }

    const [data, total] = await changeLogRepo.findAndCount({
      // relations: { product: true },
      order: { createdAt: 'DESC' },
      where: { productId },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        totalPages,
        prevPage,
        nextPage,
        total,
      },
    };
  }

  // async getChangeLogByProductIdWithCursor(
  //   schema: string,
  //   productId: string,
  //   limit: number,
  //   afterCursor?: string,
  //   beforeCursor?: string,
  // ) {
  //   limit = Math.min(200, Math.max(1, limit));

  //   const tenantDataSource =
  //     await this.tenantProvisioningService.getDataSource(schema);
  //   const changeLogRepo = tenantDataSource.getRepository(Changelog);
  //   const changeLogQueryBuilder =
  //     changeLogRepo.createQueryBuilder('changeLogs');

  //   const productRepo = tenantDataSource.getRepository(Product);

  //   const product = productRepo.findOne({ where: { id: productId } });

  //   if (!product) {
  //     throw new ResourceNotFoundException('PRODUCT', productId);
  //   }

  //   if (afterCursor) {
  //     const { id, createdAt } = decodeCursor(afterCursor);
  //     changeLogQueryBuilder
  //       .where(
  //         'changeLog.createdAt < :createdAt OR (changeLog.created = :createdAt AND changeLog.id <: id)',
  //         { createdAt, id },
  //       )
  //       .orderBy({ createdAt: 'DESC' })
  //       .addOrderBy('p.id', 'ASC');
  //   }

  //   if (!beforeCursor) {
  //     changeLogQueryBuilder
  //       .orderBy('p.createdAt', 'DESC')
  //       .addOrderBy('p.id', 'DESC');
  //   }

  //   const rows = await changeLogQueryBuilder.take(limit + 1).getMany();

  //   let hasPrevPage = false;
  //   let hasNextPage = false;
  //   let data = rows;

  //   if (beforeCursor) {
  //     data = rows.slice(0, limit).reverse();
  //     hasNextPage = true;
  //     hasPrevPage = rows?.length > limit;
  //   } else {
  //     hasNextPage = rows.length > limit;
  //     data = rows.slice(0, limit);
  //     hasPrevPage = !!afterCursor;
  //   }
  //   const nextCursor =
  //     hasNextPage && data.length > 0
  //       ? encodeCursor(
  //           data[data.length - 1].id,
  //           data[data.length - 1].createdAt,
  //         )
  //       : null;

  //   const prevCursor =
  //     hasPrevPage && data.length > 0
  //       ? encodeCursor(data[0].id, data[0].createdAt)
  //       : null;

  //   return {
  //     limit,
  //     data,
  //     nextCursor,
  //     prevCursor,
  //     hasNextPage,
  //     hasPrevPage,
  //   };
  // }
}
