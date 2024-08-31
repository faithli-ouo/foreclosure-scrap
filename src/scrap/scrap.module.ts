import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';

@Module({
  providers: [ScrapService],
  exports: [ScrapService],
})
export class ScrapModule {}
