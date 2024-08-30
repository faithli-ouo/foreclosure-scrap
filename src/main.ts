import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  //get the entire app service
  const appService = app.get(AppService);

  console.log('app start', await appService.gosite());
  console.log('get totol record', await appService.getDataTable());

  console.log('app finish');

  return app.close();
}
bootstrap();
