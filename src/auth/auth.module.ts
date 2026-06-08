import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from 'src/token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt.guard';
import { AccessJwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [TokenModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AccessJwtStrategy],
})
export class AuthModule {}
