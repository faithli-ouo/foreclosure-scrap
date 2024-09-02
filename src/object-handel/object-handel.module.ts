import { Module } from '@nestjs/common';
import { ObjectHandelService } from './object-handel.service';

@Module({
  providers: [ObjectHandelService],
  exports: [ObjectHandelService],
})
export class ObjectHandelModule {}
