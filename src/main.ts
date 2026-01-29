import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend apps
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3002',
      // Admin Dashboard
      'https://yeng-admin.vercel.app',
      'https://yeng-admin-iowhbql4g-jerome-christophers-projects.vercel.app',
      /^https:\/\/yeng-admin-.*\.vercel\.app$/,  // All admin preview deployments
      // Client Portal
      'https://client-yeng.vercel.app',
      'https://client-yeng-k3ih3ohwg-jerome-christophers-projects.vercel.app',
      'https://client-yeng-28csgmd37-jerome-christophers-projects.vercel.app',
      /^https:\/\/client-yeng-.*\.vercel\.app$/,  // All client preview deployments
    ],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
