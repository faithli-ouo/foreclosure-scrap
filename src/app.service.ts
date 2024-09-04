import { Inject, Injectable, Logger } from '@nestjs/common';
import { MainService } from './main/main.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@Inject() readonly main: MainService) {}

  @Cron('0 0 0 * * *', {
    timeZone: 'UTC+8',
  })
  handleCron() {
    console.log(`Will Start at 12:00am`);
    try {
      this.main.scrapData();
    } catch (error) {
      console.log(error);
    }
  }
}
