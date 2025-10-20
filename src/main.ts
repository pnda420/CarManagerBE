import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowList = ['http://localhost:4200', 'https://leonardsmedia.de'];
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return allowList.includes(origin) ? cb(null, true) : cb(new Error('CORS'), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT || 5200);
  console.log('🚀 Backend läuft auf http://localhost:' + (process.env.PORT || 5200));
}
bootstrap();
