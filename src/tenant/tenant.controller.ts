import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SuccessMessage } from 'src/common/decorators/success.message.decorator';
import {
  CurrentTenant,
  CurrentUser,
} from 'src/common/decorators/tenant.decorator';
import { TokenPayload } from 'src/token/token.service';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  RevokeInvitationDto,
} from './dto/index.dto';
import { Tenant } from './entities/tenant.entity';
import { TenantService } from './tenant.service';

@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @SuccessMessage('User invited successfully')
  @Post('invite')
  async inviteUserToTenant(
    @Body() dto: CreateInvitationDto,
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.tenantService.inviteUserToTenant(
      tenant.schemaName,
      user.sub,
      dto,
    );
  }

  @SuccessMessage('Invitation accepted successfully')
  @Post('accept-invitation')
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.tenantService.acceptTenantInvitation(dto);
  }

  @SuccessMessage('Invitation revoked successfully')
  @Post('revoke-invitation')
  async revokeInvitation(@Body() dto: RevokeInvitationDto) {
    return this.tenantService.revokeInvitation(dto);
  }
}
