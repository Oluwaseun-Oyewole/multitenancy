import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { DatabaseModule } from './database/database.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { TenantModule } from './tenant/tenant.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { ChangelogsModule } from './changelogs/changelogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    FeedbackModule,
    RedisModule,
    TenantModule,
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: config.get<number>('JWT_ACCESS_EXPIRES') },
      }),
    }),
    TokenModule,
    ProductsModule,
    ChangelogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
