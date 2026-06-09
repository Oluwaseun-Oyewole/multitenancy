import { Body, Controller, Post } from '@nestjs/common';
import { CurrentTenant } from 'src/common/decorators/tenant.decorator';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { ChangelogsService } from './changelogs.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';

@Controller('changelogs')
export class ChangelogsController {
  constructor(private readonly changelogsService: ChangelogsService) {}

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
}
