import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentTenant } from 'src/common/decorators/tenant.decorator';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentTenant() tenant: Tenant,
  ) {
    return this.productsService.createProduct(
      createProductDto,
      tenant.schemaName,
    );
  }
}
