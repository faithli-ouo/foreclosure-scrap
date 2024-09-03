import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ScrapService } from './scrap/scrap.service';

const scarp_pages = [
  { id: 'saletype_1', name: '一般程序' },
  { id: 'saletype_4', name: '應買公告' },
  { id: 'saletype_5', name: '拍定結果' },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the AppService
  const appService = app.get(AppService);
  await appService.startApp();

  // Get the ScrapService
  const scrapService = app.get(ScrapService);

  for (let index = 0; index < scarp_pages.length; index++) {
    await scrapService.openBrowser();
    const id = scarp_pages[index].id;
    console.log(`Start Scarp ${scarp_pages[index].name}`);
    await scrapService.goInsidePage(id);
    const total_info = await scrapService.getPageInfo();
    await scrapService.getAllData(total_info, id);
  }

  scrapService.closeDriver();
}

bootstrap();
