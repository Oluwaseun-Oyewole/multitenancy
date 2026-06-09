import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../exceptions/domain.exceptions';

export interface TenantRequest extends Request {
  tenant: Tenant;
}

const NON_TENANT_PATHS = ['localhost', 'www', 'app', '127'];
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}
  async use(req: TenantRequest, res: Response, next: NextFunction) {
    let slug: string | undefined;

    if (process.env.NODE_ENV === 'production') {
      slug = req.hostname.split('.')[0];
    } else {
      slug = req.headers['x-tenant-slug'] as string | undefined;
    }
    if (slug && slug.split('_')[0] === 'tenant') {
      slug = slug.split('_')[1];
    }

    if (!slug || NON_TENANT_PATHS.includes(slug)) {
      return next();
    }

    const tenant = await this.tenantRepository.findOne({
      where: { slug },
    });

    if (!tenant) {
      throw new ResourceNotFoundException('TENANT', slug);
    }

    req.tenant = tenant;
    next();
  }
}
