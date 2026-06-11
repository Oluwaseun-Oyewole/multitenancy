import { Injectable } from '@nestjs/common';
import { IPaginate } from 'src/common/dto/success.response.dto';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
    tenantSchema: string,
  ) {
    const tenantDataSource =
      await this.tenantProvisioningService.getDataSource(tenantSchema);

    const productRepo = tenantDataSource.getRepository(Product);
    const product = productRepo.create({
      ...createProductDto,
      tenantSchema,
    });
    return productRepo.save(product);
  }

  async getProducts(
    tenantSchema: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<IPaginate<Product[]>> {
    limit = Math.min(limit, 200);
    const offset = (page - 1) * limit;

    page = Math.max(page, 1);

    const tenantDataSource =
      await this.tenantProvisioningService.getDataSource(tenantSchema);

    const productRepo = tenantDataSource.getRepository(Product);
    const query = productRepo.createQueryBuilder('product');

    if (search) {
      query.where('product.title ILIKE :search', { search: `%${search}%` });
    }
    const products = await query.skip(offset).take(limit).getMany();
    const total = await query.getCount();

    const totalPages = Math.ceil(total / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        prevPage,
        nextPage,
      },
    };
  }
}
