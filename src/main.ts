import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the AppService
  const appService = app.get(AppService);
  appService.startApp();
  appService.scrapData();
}
bootstrap();
