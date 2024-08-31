import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  //1. Init Selenium Browser and Go To Site Url
  startApp(): void {
    console.log('App Start');
  }
}
