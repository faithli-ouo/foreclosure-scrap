import { Injectable } from '@nestjs/common';
import { Builder, By, until } from 'selenium-webdriver';

export type total_info = {
  total_page: number;
  total_record: number;
  current_page: number;
};

//define selenium driver and the target url
const driver = new Builder().forBrowser('firefox').build();
const site_url = 'https://aomp109.judicial.gov.tw/judbp/wkw/WHD1A02.htm';

@Injectable()
export class ScrapService {
  //1. Init Selenium Browser and Go To Site Url
  async openBrowser(): Promise<void> {
    try {
      // Navigate to the target website
      await driver.get(site_url);
      // Switch to the first iframe
      await driver.switchTo().frame('v1');

      console.log('Browser Initialized');
    } catch (error) {
      console.log(error);
    }
  }

  async goForeclosure(): Promise<void> {
    try {
      // Click on the element inside the first iframe
      await driver
        .findElement(
          By.xpath(
            '//table/tbody/tr/td/label[@title="查詢房屋或土地資料(房屋、土地複選查詢)"]',
          ),
        )
        .click();

      // Click the 'ok' button inside the first iframe
      await driver.findElement(By.id('btn_ok')).click();

      // Switch back to the main content (default frame)
      await driver.switchTo().defaultContent();

      // Switch to the second iframe
      await driver.switchTo().frame('v2');
      console.log('Arrived Foreclosure Page');
    } catch (error) {
      console.log(error);
    }
  }

  //2. Get The Total Info And Page Info Of the Site
  async getPageInfo(): Promise<void> {
    const total_recordText: string = await driver
      .wait(until.elementLocated(By.id('total_info')))
      .getText();

    const total_record: string = total_recordText.match(/\d+/)[0];

    const page_info: string = await driver
      .wait(until.elementLocated(By.id('page_info')))
      .getText();

    const page_infoParts: string[] = page_info.split(' / ');
    const current_page: string = page_infoParts[0].match(/\d+/)[0];
    const total_page: string = page_infoParts[1].match(/\d+/)[0];

    const total_info: total_info = {
      total_page: parseInt(total_page),
      total_record: parseInt(total_record),
      current_page: parseInt(current_page),
    };
    console.log(total_info);
  }

  closeDriver(): void {
    driver.close();
  }
}
