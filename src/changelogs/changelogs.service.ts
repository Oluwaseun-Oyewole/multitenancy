import { Injectable } from '@nestjs/common';
import { TenantProvisioningService } from 'src/database/tenant-datasource.service';
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
}
