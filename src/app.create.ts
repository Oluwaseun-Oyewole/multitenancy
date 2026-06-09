import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { SuccessResponseInterceptor } from './common/interceptors/success.response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

export async function appCreate(app: INestApplication) {
  const configService = app.get(ConfigService);
  const allowedOrigins =
    configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [];

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      filter: true,
      showRequestHeaders: true,
      deepLinking: true,
    },
    customCss: '.topbar { display: none }',
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    // new CacheInterceptor(),
    // new ErrorResponseInterceptor(),
    new SuccessResponseInterceptor(app.get(Reflector)),
    new TimeoutInterceptor(app.get(Reflector)),
  );

  const config = new DocumentBuilder()
    .setTitle('Multi-Tenancy API')
    .setDescription(
      'API documentation for the Multi-Tenancy application, providing endpoints for authentication, tenant management, and user operations.',
    )
    .setVersion('1.0.0')
    .addTag(
      'Multi-Tenancy',
      'Endpoints for managing tenants and users in a multi-tenant architecture',
    )
    .addServer(`http://localhost:3010`, 'Local')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token in Authorization header as Bearer <token>',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Refresh token in Authorization header as Bearer <token>',
        name: 'Authorization',
        in: 'header',
      },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
  });

  SwaggerModule.setup('api', app, document, customOptions);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
    ],
  });

  app.setGlobalPrefix('api');
}
