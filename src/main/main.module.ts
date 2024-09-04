import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { ScrapModule } from 'src/scrap/scrap.module';

@Module({
  imports: [ScrapModule],
  providers: [MainService],
  exports: [MainService],
})
export class MainModule {}
