import { Body, Controller, Post } from '@nestjs/common';
import { CurrentTenant } from 'src/common/decorators/tenant.decorator';
import { BadRequestException } from 'src/common/exceptions/domain.exceptions';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/index.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@CurrentTenant() tenant: Tenant, @Body() loginDto: LoginDto) {
    if (!tenant) {
      throw new BadRequestException('Tenant context is required.');
    }
    return this.authService.login(tenant, loginDto);
  }
}
