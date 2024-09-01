import { Injectable } from '@nestjs/common';
import { Builder, By, until } from 'selenium-webdriver';
import { DateTime } from 'luxon';
import { PGDataService } from 'src/pg-data/pg-data.service';

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

export type foreclosure_item_row = {
  case_number: string;
  type: string;
  court: string;
  year: number;
  zhcode: string;
  stock: string;
  bid_date: Date;
  bid_times: number;
  country: string;
  city: string;
  address: string;
  full_address: string;
  ratio: string;
  ping: number;
  square_meter: number;
  base_price: number;
  total_base_price: number;
  handover: string;
  empty: string;
  is_unregistered_building: boolean;
  marking: string;
  remark?: string;
};

//define selenium driver and the target url
const driver = new Builder().forBrowser('firefox').build();
const site_url = 'https://aomp109.judicial.gov.tw/judbp/wkw/WHD1A02.htm';

@Injectable()
export class ScrapService {
  constructor(private readonly PGDataService: PGDataService) {}

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
  async getPageInfo(): Promise<page_info> {
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

  async getAllForeclosurettableData(total_info: page_info): Promise<void> {
    for (let page = 1; page <= total_info.total_page; page++) {
      console.log(`Page: ${page}`);
      await this.getForeclosureTableData();
      console.log(`Page: ${page} Finish Scarping`);

      if (page !== total_info.total_page) {
        const nextPage_btn = await driver.wait(
          until.elementLocated(By.css('.fa-caret-right')),
        );
        nextPage_btn.click();
      }
    }
  }

  async getForeclosureTableData(): Promise<void> {
    await driver.wait(
      until.elementLocated(By.css('#tablecontext tbody')),
      10000,
    );
    const rows = await driver.findElements(By.css('#tablecontext tbody tr'));
    for (const row of rows) {
      const rowCells = await row.findElements(By.css('td'));
      let rowData: foreclosure_item_row = {
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
              city: cell5_parts[1],
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
      console.log(imageExist);
      await this.PGDataService.upsertForeclosureItem(rowData);
    }
  }

  closeDriver(): void {
    driver.close();
  }
}
