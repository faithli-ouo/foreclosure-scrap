import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapModule } from './scrap/scrap.module';

@Module({
  imports: [ScrapModule],
  providers: [AppService],
})
export class AppModule {}
