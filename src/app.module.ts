import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapModule } from './scrap/scrap.module';
import { ConfigModule } from '@nestjs/config';
import { PGDataModule } from './pg-data/pg-data.module';
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
  imports: [ConfigModule.forRoot(), ScrapModule, PGDataModule, DrizzleModule],
  providers: [AppService],
})
export class AppModule {}
