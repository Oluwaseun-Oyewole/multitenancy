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
import { ChangelogsService } from './changelogs.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';

@UseGuards(JwtAuthGuard)
@Controller('changelogs')
export class ChangelogsController {
  constructor(private readonly changelogsService: ChangelogsService) {}

  @SuccessMessage('Changelog created successfully')
  @Post()
  create(
    @CurrentTenant() tenant: Tenant,
    @Body() createChangelogDto: CreateChangelogDto,
  ) {
    return this.changelogsService.createChangeLogs(
      tenant.schemaName,
      createChangelogDto,
    );
  }

  @SuccessMessage('Changelog fetched successfully')
  @Get()
  getChangeLogs(
    @CurrentTenant() tenant: Tenant,
    @Query('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.changelogsService.getChangeLogByProductId(
      tenant.schemaName,
      productId,
      page,
      limit,
    );
  }
}
