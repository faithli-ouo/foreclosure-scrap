import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { PGDataModule } from 'src/pg-data/pg-data.module';

@Module({
  imports: [PGDataModule],
  providers: [ScrapService],
  exports: [ScrapService],
})
export class ScrapModule {}
