import { Module } from '@nestjs/common';
import { PGDataService } from './pg-data.service';
import { ObjectHandelModule } from 'src/object-handel/object-handel.module';

@Module({
  imports: [ObjectHandelModule],
  providers: [PGDataService],
  exports: [PGDataService],
})
export class PGDataModule {}
