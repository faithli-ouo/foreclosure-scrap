import { Injectable } from '@nestjs/common';
import { Builder, By, until } from 'selenium-webdriver';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import firefox = require('selenium-webdriver/firefox');
import { DateTime } from 'luxon';
import { PGDataService } from 'src/pg-data/pg-data.service';
import { ObjectHandelService } from 'src/object-handel/object-handel.service';
import type { postbidprice, postforeclosure, postshouldbuy } from 'db/schema';

export type total_info = {
  total_page: number;
  total_record: number;
  current_page: number;
};

export type page_info = {
  total_page: number;
  total_record: number;
  current_page: number;
};

//define selenium driver and the target url
const firefoxOptions = new firefox.Options();
firefoxOptions.addArguments('-headless');
firefoxOptions.setBinary('/usr/bin/firefox');

const site_url = 'https://aomp109.judicial.gov.tw/judbp/wkw/WHD1A02.htm';

@Injectable()
export class ScrapService {
  constructor(
    private readonly PGDataService: PGDataService,
    private readonly minio: ObjectHandelService,
  ) {}

  //1. Init Selenium Browser and Go To Site Url
  async openBrowser(): Promise<any> {
    try {
      const driver = new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();

      // Navigate to the target website
      await driver.get(site_url);
      // Switch to the first iframe
      await driver.switchTo().frame('v1');

      console.log('Browser Initialized');
      return driver;
    } catch (error) {
      console.log(error);
    }
  }

  async goInsidePage(
    scrap_page: { id: string; name: string },
    driver: any,
  ): Promise<void> {
    try {
      // Select the Page you wanna go
      await driver.findElement(By.id(scrap_page.id)).click();

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
      console.log(`Start Scarp ${scrap_page.name}`);
    } catch (error) {
      console.log(error);
    }
  }

  //2. Get The Total Info And Page Info Of the Site
  async getPageInfo(driver): Promise<page_info> {
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
    return total_info;
  }

  async getAllData(
    total_info: page_info,
    scarp_pages_id: string,
    driver: any,
  ): Promise<void> {
    for (let page = 1; page <= total_info.total_page; page++) {
      console.log(`Page: ${page}`);
      switch (scarp_pages_id) {
        case 'saletype_1':
          await this.getForeclosureTableData(driver);
          break;
        case 'saletype_4':
          await this.getShouldbuyTableData(driver);
          break;
        case 'saletype_5':
          await this.getBidprice(driver);
          break;
        default:
          break;
      }

      console.log(`Page: ${page} Finish Scarping`);

      if (page !== total_info.total_page) {
        await this.nextpage(driver);
      }
    }
  }

  async getForeclosureTableData(driver): Promise<void> {
    await driver.wait(
      until.elementLocated(By.css('#tablecontext tbody')),
      10000,
    );
    const rows = await driver.findElements(By.css('#tablecontext tbody tr'));
    for (const row of rows) {
      const rowCells = await row.findElements(By.css('td'));
      let rowData: postforeclosure = {
        case_number: '',
        type: '',
        court: '',
        year: 0,
        zhcode: '',
        stock: '',
        bid_date: new Date(0), // Unix epoch
        bid_times: 0,
        country: '',
        city: '',
        address: '',
        full_address: '',
        ratio: '',
        ping: 0,
        square_meter: 0,
        base_price: 0,
        total_base_price: 0,
        handover: '',
        empty: '',
        is_unregistered_building: false,
        marking: '',
        remark: '',
      };
      let rowNumber: string;
      let imageExist = false;

      for (let i = 0; i < rowCells.length; i++) {
        const cellText = await rowCells[i].getText();
        switch (i) {
          case 0:
            rowNumber = cellText;
            console.log(rowNumber);
            break;

          case 1:
            rowData = { ...rowData, court: cellText.replace('\n', '') };
            break;

          case 2:
            // Split by '司'
            const cell2_part1 = cellText.split('司');

            // Split by '第'
            const cell2_part2 = cell2_part1[1].split('第');

            // Extract case number from cell2_part2[1] and handle cases where match might return null
            const caseNumberMatch = cell2_part2[1].match(/\d+/);

            // Split remaining part by '/'
            const cell2_part3 = cell2_part2[1].split('(');

            rowData = {
              ...rowData,
              year: parseInt(cell2_part1[0]),
              zhcode: '司' + cell2_part2[0],
              case_number: caseNumberMatch ? caseNumberMatch[0] : '',
              stock: cell2_part3[1] ? cell2_part3[1].replace(')', '') : '',
            };
            break;

          case 3:
            const cell4_parts = cellText.split('\n');
            const cell_date = cell4_parts[0].split('/');
            rowData = {
              ...rowData,
              bid_date: new Date(
                DateTime.fromSQL(
                  `${parseInt(cell_date[0]) + 1911}-${cell_date[1]}-${cell_date[2]}`,
                  { zone: 'UTC+8' },
                )
                  .toUTC()
                  .toISO(),
              ),
              bid_times: parseInt(cell4_parts[1].match(/\d+/)[0]),
            };
            break;

          case 4:
            const cell5_parts = cellText.split('\n');
            rowData = {
              ...rowData,
              country: cell5_parts[0],
              city: cell5_parts[1] ?? '',
            };
            break;

          case 5:
            const cell6_parts = cellText.split('\n');
            // Handle address
            let cell6_part1 = cell6_parts[0].replace(' ', '');
            if (cell6_part1.includes(rowData.country)) {
              cell6_part1.replace(rowData.country, '');
            }
            if (cell6_part1.includes(rowData.city)) {
              cell6_part1.replace(rowData.city, '');
            }
            if (cell6_part1.includes('保存')) {
              cell6_part1 = cell6_part1.split('(')[0];
            }

            const cell6_part2 = cell6_parts[1];

            const cell6_part2_1 = cell6_part2.split('坪(');
            const cell6_part2_2 = cell6_part2_1[1].split(/ x | X /i);
            const cell6_part3 = cell6_parts[2];

            rowData = {
              ...rowData,
              is_unregistered_building: cell6_part1.includes('保存')
                ? true
                : false,
              address: cell6_part1,
              full_address: rowData.country + rowData.city + cell6_part1,
              ping: parseFloat(cell6_part2_1[0]),
              square_meter: parseFloat(
                cell6_part2_2[0].replace('平方公尺)', ''),
              ),
              ratio: cell6_part2_2[1],
              type: cell6_part3.includes('土地') ? 'land' : 'building',
              base_price: cell6_part3.match(/[\d,]+/)
                ? parseFloat(cell6_part3.match(/[\d,]+/)[0].replace(/,/g, ''))
                : 0,
            };
            break;

          case 6:
            rowData = {
              ...rowData,
              total_base_price: parseFloat(cellText.replace(/,/g, '')),
            };
            break;

          case 7:
            rowData = {
              ...rowData,
              handover: cellText.trim(),
            };
            break;

          case 8:
            rowData = {
              ...rowData,
              empty: cellText.trim(),
            };
            break;

          case 9:
            rowData = {
              ...rowData,
              marking: cellText.trim(),
            };
            break;

          case 10:
            try {
              await row.findElement(
                By.xpath('.//td[@id="picTd"]//button[@title="查看照片"]'),
              );
              console.log(`Row: ${rowNumber} Images Exist`);
              imageExist = true;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {}

            break;

          case 11:
            rowData = {
              ...rowData,
              remark: cellText.trim(),
            };
            break;

          default:
            break;
        }
      }
      await this.PGDataService.upsertForeclosureItem(rowData);

      if (imageExist) {
        //Find Is Bucket Exist or Not
        const bucketExist = await this.minio.findBucket(rowData.case_number);

        //If Exist Break the loop
        if (!bucketExist) {
          await this.scarp_images(rowData.case_number, row, driver);
        }
        console.log(`${rowData.case_number}' Images Scarped`);
      }
    }
  }

  async getShouldbuyTableData(driver): Promise<void> {
    await driver.wait(
      until.elementLocated(By.css('#tablecontext tbody')),
      10000,
    );
    const rows = await driver.findElements(By.css('#tablecontext tbody tr'));
    for (const row of rows) {
      const rowCells = await row.findElements(By.css('td'));
      let rowData: postshouldbuy = {
        case_number: '',
        type: '',
        court: '',
        year: 0,
        zhcode: '',
        stock: '',
        bid_date: new Date(0), // Unix epoch
        country: '',
        city: '',
        address: '',
        full_address: '',
        ratio: '',
        ping: 0,
        square_meter: 0,
        base_price: 0,
        total_base_price: 0,
        handover: '',
        empty: '',
        is_unregistered_building: false,
        marking: '',
        remark: '',
      };
      let rowNumber: string;
      let imageExist = false;

      for (let i = 0; i < rowCells.length; i++) {
        const cellText = await rowCells[i].getText();
        switch (i) {
          case 0:
            rowNumber = cellText;
            console.log(rowNumber);
            break;

          case 1:
            rowData = { ...rowData, court: cellText.replace('\n', '') };
            break;

          case 2:
            // Split by '司'
            const cell2_part1 = cellText.split('司');

            // Split by '第'
            const cell2_part2 = cell2_part1[1].split('第');

            // Extract case number from cell2_part2[1] and handle cases where match might return null
            const caseNumberMatch = cell2_part2[1].match(/\d+/);

            // Split remaining part by '/'
            const cell2_part3 = cell2_part2[1].split('(');

            rowData = {
              ...rowData,
              year: parseInt(cell2_part1[0]),
              zhcode: '司' + cell2_part2[0],
              case_number: caseNumberMatch ? caseNumberMatch[0] : '',
              stock: cell2_part3[1] ? cell2_part3[1].replace(')', '') : '',
            };
            break;

          case 3:
            const cell4_parts = cellText.split('\n');
            const cell_date = cell4_parts[0].split('/');
            rowData = {
              ...rowData,
              bid_date: new Date(
                DateTime.fromSQL(
                  `${parseInt(cell_date[0]) + 1911}-${cell_date[1]}-${cell_date[2]}`,
                )
                  .toUTC()
                  .toISO(),
              ),
            };
            break;

          case 4:
            const cell5_parts = cellText.split('\n');
            rowData = {
              ...rowData,
              country: cell5_parts[0],
              city: cell5_parts[1] ?? '',
            };
            break;

          case 5:
            const cell6_parts = cellText.split('\n');
            // Handle address
            let cell6_part1 = cell6_parts[0].replace(' ', '');
            if (cell6_part1.includes(rowData.country)) {
              cell6_part1.replace(rowData.country, '');
            }
            if (cell6_part1.includes(rowData.city)) {
              cell6_part1.replace(rowData.city, '');
            }
            if (cell6_part1.includes('保存')) {
              cell6_part1 = cell6_part1.split('(')[0];
            }

            const cell6_part2 = cell6_parts[1];

            const cell6_part2_1 = cell6_part2.split('坪(');
            const cell6_part2_2 = cell6_part2_1[1].split(/ x | X /i);
            const cell6_part3 = cell6_parts[2];

            rowData = {
              ...rowData,
              is_unregistered_building: cell6_part1.includes('保存')
                ? true
                : false,
              address: cell6_part1,
              full_address: rowData.country + rowData.city + cell6_part1,
              ping: parseFloat(cell6_part2_1[0]),
              square_meter: parseFloat(
                cell6_part2_2[0].replace('平方公尺)', ''),
              ),
              ratio: cell6_part2_2[1],
              type: cell6_part3.includes('土地') ? 'land' : 'building',
              base_price: cell6_part3.match(/[\d,]+/)
                ? parseFloat(cell6_part3.match(/[\d,]+/)[0].replace(/,/g, ''))
                : 0,
            };
            break;

          case 6:
            rowData = {
              ...rowData,
              total_base_price: parseFloat(cellText.replace(/,/g, '')),
            };
            break;

          case 7:
            rowData = {
              ...rowData,
              handover: cellText.trim(),
            };
            break;

          case 8:
            rowData = {
              ...rowData,
              empty: cellText.trim(),
            };
            break;

          case 9:
            rowData = {
              ...rowData,
              marking: cellText.trim(),
            };
            break;

          case 10:
            try {
              await row.findElement(
                By.xpath('.//td[@id="picTd"]//button[@title="查看照片"]'),
              );
              console.log(`Row: ${rowNumber} Images Exist`);
              imageExist = true;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {}

            break;

          case 11:
            rowData = {
              ...rowData,
              remark: cellText.trim(),
            };
            break;

          default:
            break;
        }
      }
      await this.PGDataService.upsertShouldbuyItem(rowData);

      if (imageExist) {
        //Find Is Bucket Exist or Not
        const bucketExist = await this.minio.findBucket(rowData.case_number);

        //If Exist Break the loop
        if (!bucketExist) {
          await this.scarp_images(rowData.case_number, row, driver);
        }
        console.log(`${rowData.case_number}' Images Scarped`);
      }
    }
  }

  async getBidprice(driver): Promise<void> {
    await driver.wait(
      until.elementLocated(By.css('#tablecontext tbody')),
      10000,
    );
    const rows = await driver.findElements(By.css('#tablecontext tbody tr'));
    for (const row of rows) {
      const rowCells = await row.findElements(By.css('td'));
      let rowData: postbidprice = {
        case_number: '',
        court: '',
        year: 0,
        zhcode: '',
        stock: '',
        bid_date: new Date(0), // Unix epoch
        country: '',
        city: '',
        address: '',
        full_address: '',
        ratio: '',
        ping: 0,
        square_meter: 0,
        item_bid_price: 0,
        total_bid_price: 0,
        final_total_bid_price: 0,
        price_diff: 0.0,
      };
      let rowNumber: string;

      for (let i = 0; i < rowCells.length; i++) {
        const cellText = await rowCells[i].getText();
        switch (i) {
          case 0:
            rowNumber = cellText;
            console.log(rowNumber);
            break;

          case 1:
            rowData = { ...rowData, court: cellText.replace('\n', '') };
            break;

          case 2:
            // Split by '司'
            const cell2_part1 = cellText.split('司');

            // Split by '第'
            const cell2_part2 = cell2_part1[1].split('第');

            // Extract case number from cell2_part2[1] and handle cases where match might return null
            const caseNumberMatch = cell2_part2[1].match(/\d+/);

            // Split remaining part by '/'
            const cell2_part3 = cell2_part2[1].split('(');

            rowData = {
              ...rowData,
              year: parseInt(cell2_part1[0]),
              zhcode: '司' + cell2_part2[0],
              case_number: caseNumberMatch ? caseNumberMatch[0] : '',
              stock: cell2_part3[1] ? cell2_part3[1].replace(')', '') : '',
            };
            break;

          case 3:
            const cell4_parts = cellText.split('\n');
            const cell_date = cell4_parts[0].split('/');
            rowData = {
              ...rowData,
              bid_date: new Date(
                DateTime.fromSQL(
                  `${parseInt(cell_date[0]) + 1911}-${cell_date[1]}-${cell_date[2]}`,
                )
                  .toUTC()
                  .toISO(),
              ),
            };
            break;

          case 4:
            const cell5_parts = cellText.split('\n');
            rowData = {
              ...rowData,
              country: cell5_parts[0],
              city: cell5_parts[1] ?? '',
            };
            break;

          case 5:
            const cell6_parts = cellText.split('\n');
            // Handle address
            let cell6_part1 = cell6_parts[0].replace(' ', '');
            if (cell6_part1.includes(rowData.country)) {
              cell6_part1.replace(rowData.country, '');
            }
            if (cell6_part1.includes(rowData.city)) {
              cell6_part1.replace(rowData.city, '');
            }
            if (cell6_part1.includes('保存')) {
              cell6_part1 = cell6_part1.split('(')[0];
            }

            const cell6_part2 = cell6_parts[1];

            const cell6_part2_1 = cell6_part2.split('坪(');
            const cell6_part2_2 = cell6_part2_1[1].split(/ x | X /i);
            const cell6_part3 = cell6_parts[2];

            rowData = {
              ...rowData,
              address: cell6_part1,
              full_address: rowData.country + rowData.city + cell6_part1,
              ping: parseFloat(cell6_part2_1[0]),
              square_meter: parseFloat(
                cell6_part2_2[0].replace('平方公尺)', ''),
              ),
              ratio: cell6_part2_2[1],
              item_bid_price: cell6_part3.match(/[\d,]+/)
                ? parseFloat(cell6_part3.match(/[\d,]+/)[0].replace(/,/g, ''))
                : 0,
            };
            break;

          case 6:
            rowData = {
              ...rowData,
              total_bid_price: parseFloat(cellText.replace(/,/g, '')),
            };
            break;

          case 7:
            rowData = {
              ...rowData,
              final_total_bid_price: parseFloat(cellText.replace(/,/g, '')),
            };
            break;

          case 8:
            rowData = {
              ...rowData,
              price_diff:
                // eslint-disable-next-line prettier/prettier
                parseFloat((((rowData.final_total_bid_price - rowData.total_bid_price) /
                      // eslint-disable-next-line prettier/prettier
                  rowData.total_bid_price) +
                    1
                  ).toFixed(3),
                ),
            };
            break;

          default:
            break;
        }
      }
      await this.PGDataService.upsertBidprice(rowData);
    }
  }

  async scarp_images(
    case_number: string,
    row: any,
    driver: any,
  ): Promise<void> {
    let imagesPath: string[] | [] = [];

    const imageButton = await row.findElement(
      By.css('td#picTd button[title="查看照片"]'),
    );

    // Wait for the button to be both visible and enabled
    await driver.wait(until.elementIsVisible(imageButton), 5000);

    // Scroll the button into view to ensure it's clickable
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      imageButton,
    );

    // Add a small delay to allow any animations to complete
    await driver.sleep(500);

    // Click the button
    await imageButton.click();

    try {
      // Store the original window handle
      const originalWindow = await driver.getWindowHandle();
      // Switch to the new window
      await this.switchWindow(driver);
      // Switch to the 'v1' frame and scrape images
      const iframe = await driver.wait(until.elementLocated(By.name('v1')));
      await driver.switchTo().frame(iframe);

      //Fetch Image
      try {
        await driver.wait(
          until.elementLocated(By.css('#tablecontext tbody')),
          2000,
        );
        await driver.sleep(1000);
        const total_info = await this.getPageInfo(driver);
        console.log('Images - ' + case_number + ': ' + total_info.total_record);

        for (let page = 1; page <= total_info.total_page; page++) {
          // Wait for the image elements to be located
          const image_elements = await driver.findElements(
            By.xpath(
              '//img[contains(@src, "/judkp/wkp/PHD1A01/IMAGES.htm?picture=")]',
            ),
          );
          // Iterate over the located elements
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [index, imageElement] of image_elements.entries()) {
            // Get the 'src' attribute of each image
            const imageSrc = await imageElement.getAttribute('src');

            const imagePath = await this.minio.fetchOpUploadImages(
              imageSrc,
              case_number,
            );

            imagesPath = [...imagesPath, imagePath];
          }

          if (page !== total_info.total_page) {
            await this.nextpage(driver);
            await driver.wait(
              until.elementLocated(By.css('#tablecontext tbody')),
              2000,
            );
            await driver.sleep(1000);
          }
        }
        // Finish Scarp Image
        console.log('Finsih Scrap All Images - ' + case_number);
        console.log('Close Popup Window');
      } catch (e) {
        console.error(e);
      }

      await this.PGDataService.postImagesPath(case_number, imagesPath);

      // Close the current window
      await driver.close();
      // Switch back to the original window
      await driver.switchTo().window(originalWindow);
      // Now switch to the 'v2' frame in the original window
      await driver.switchTo().defaultContent(); // First, ensure we're at the top level
      const iframe2 = await driver.wait(until.elementLocated(By.name('v2')));
      await driver.switchTo().frame(iframe2);
    } catch (error) {
      console.error(error);
      // If an error occurs, make sure we're back in the original window
      const windows = await driver.getAllWindowHandles();
      await driver.switchTo().window(windows[0]);
      await driver.switchTo().defaultContent();
      const iframe2 = await driver.wait(until.elementLocated(By.name('v2')));
      await driver.switchTo().frame(iframe2);
    }
  }

  closeDriver(driver): void {
    driver.close();
  }

  async nextpage(driver): Promise<void> {
    const nextPage_btn = await driver.wait(
      until.elementLocated(By.css('.fa-caret-right')),
    );
    nextPage_btn.click();
  }

  async switchWindow(driver) {
    try {
      const currentWindowHandle = await driver.getWindowHandle();
      const allWindowHandles = await driver.getAllWindowHandles();
      const otherWindowHandle = allWindowHandles.find(
        (handle) => handle !== currentWindowHandle,
      );
      if (otherWindowHandle) {
        await driver.switchTo().window(otherWindowHandle);
      }
    } catch (e) {
      console.log('error: ' + e);
    }
  }
}
