import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { PGDataModule } from 'src/pg-data/pg-data.module';
import { ObjectHandelModule } from 'src/object-handel/object-handel.module';

@Module({
  imports: [PGDataModule, ObjectHandelModule],
  providers: [ScrapService],
  exports: [ScrapService],
})
export class ScrapModule {}
