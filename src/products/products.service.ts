import { Injectable } from '@nestjs/common';
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
}
