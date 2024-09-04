import { Inject, Injectable } from '@nestjs/common';
import { ScrapService } from './scrap/scrap.service';

const scarp_pages = [
  { id: 'saletype_1', name: '一般程序' },
  { id: 'saletype_4', name: '應買公告' },
  { id: 'saletype_5', name: '拍定結果' },
];

@Injectable()
export class AppService {
  constructor(@Inject() readonly scrap: ScrapService) {}
  //1. Init Selenium Browser and Go To Site Url
  startApp(): void {
    console.log('App Start');
  }

  scrapData(): void {
    console.log('Start Scraping Service');
    this.getForeclosureTableData();
    this.gethouldbuyTableData();
    this.getBidpriceTableData();
  }

  async getForeclosureTableData(): Promise<void> {
    //Open Browser Get to Url
    const driver = await this.scrap.openBrowser();
    const id = scarp_pages[0].id;

    //Go Inside Page prepare for scraping
    await this.scrap.goInsidePage(id, driver);

    //Get Total pages and record numbers
    const total_info = await this.scrap.getPageInfo(driver);

    //Start Scraping
    await this.scrap.getAllData(total_info, id, driver);

    //Close Browser
    this.scrap.closeDriver(driver);
  }

  async gethouldbuyTableData(): Promise<void> {
    //Open Browser Get to Url
    const driver = await this.scrap.openBrowser();
    const id = scarp_pages[1].id;

    //Go Inside Page prepare for scraping
    await this.scrap.goInsidePage(id, driver);

    //Get Total pages and record numbers
    const total_info = await this.scrap.getPageInfo(driver);

    //Start Scraping
    await this.scrap.getAllData(total_info, id, driver);

    //Close Browser
    this.scrap.closeDriver(driver);
  }

  async getBidpriceTableData(): Promise<void> {
    //Open Browser Get to Url
    const driver = await this.scrap.openBrowser();
    const id = scarp_pages[2].id;

    //Go Inside Page prepare for scraping
    await this.scrap.goInsidePage(id, driver);

    //Get Total pages and record numbers
    const total_info = await this.scrap.getPageInfo(driver);

    //Start Scraping
    await this.scrap.getAllData(total_info, id, driver);

    //Close Browser
    this.scrap.closeDriver(driver);
  }
}
