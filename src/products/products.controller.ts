import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SuccessMessage } from 'src/common/decorators/success.message.decorator';
import { CurrentTenant } from 'src/common/decorators/tenant.decorator';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @SuccessMessage('Product created successfully')
  @Post()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentTenant() tenant: Tenant,
  ) {
    return this.productsService.createProduct(
      createProductDto,
      tenant.schemaName,
    );
  }

  @SuccessMessage('Products retrieved successfully')
  @Get()
  getProducts(
    @CurrentTenant() tenant: Tenant,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.productsService.getProducts(
      tenant.schemaName,
      page,
      limit,
      search,
    );
  }
}
