import { Injectable } from '@nestjs/common';
import { Builder, By, until } from 'selenium-webdriver';

//define selenium driver and the target url
const driver = new Builder().forBrowser('firefox').build();
const site_url = 'https://aomp109.judicial.gov.tw/judbp/wkw/WHD1A02.htm';

@Injectable()
export class AppService {
  async gosite(): Promise<void> {
    try {
      // Navigate to the target website
      await driver.get(site_url);
      // Switch to the first iframe
      await driver.switchTo().frame('v1');
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
    } catch (error) {
      console.error(error);
    }
  }

  async getDataTable(): Promise<void> {
    const totalRecordElement = await driver.wait(
      until.elementLocated(By.id('total_info')),
    );
    const totalRecordText = await totalRecordElement.getText();
    console.log(totalRecordText);
  }
}
