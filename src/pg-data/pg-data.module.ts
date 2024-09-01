import { Module } from '@nestjs/common';
import { PGDataService } from './pg-data.service';

@Module({
  providers: [PGDataService],
  exports: [PGDataService],
})
export class PGDataModule {}
