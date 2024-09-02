import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapModule } from './scrap/scrap.module';
import { ConfigModule } from '@nestjs/config';
import { PGDataModule } from './pg-data/pg-data.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [ConfigModule.forRoot(), ScrapModule, PGDataModule, DrizzleModule, S3Module],
  providers: [AppService],
})
export class AppModule {}
