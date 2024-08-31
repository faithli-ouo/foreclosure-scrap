import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ScrapService } from './scrap/scrap.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the AppService
  const appService = app.get(AppService);
  await appService.startApp();

  // Get the ScrapService
  const scrapService = app.get(ScrapService);

  await scrapService.openBrowser();
  await scrapService.goForeclosure();
  await scrapService.getPageInfo();
  scrapService.closeDriver();
}

bootstrap();
