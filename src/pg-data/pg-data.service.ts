import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from 'db/schema'; // Ensure this path is correct
import { eq, and } from 'drizzle-orm';
import type {
  postImages,
  postforeclosure,
  postshouldbuy,
  postbidprice,
} from 'db/schema';

type DrizzleDB = PostgresJsDatabase<typeof schema>;
@Injectable()
export class PGDataService {
  constructor(@Inject('DRIZZLE_ORM') private readonly db: DrizzleDB) {}
  async upsertForeclosureItem(rowData: postforeclosure): Promise<string> {
    //Fetch Data from DB
    const res = await this.db
      .select()
      .from(schema.foreclosure)
      .where(
        and(
          eq(schema.foreclosure.case_number, rowData.case_number),
          eq(schema.foreclosure.full_address, rowData.full_address),
          eq(schema.foreclosure.ping, rowData.ping),
          eq(schema.foreclosure.base_price, rowData.base_price),
          eq(schema.foreclosure.bid_date, rowData.bid_date),
          eq(schema.foreclosure.bid_times, rowData.bid_times),
          eq(schema.foreclosure.marking, rowData.marking),
          eq(schema.foreclosure.type, rowData.type),
        ),
      );

    //No Record Found, Insert Data
    if (res.length < 1) {
      console.log(`No Duplicate Data Found Insert Data`);
      const insertNewData = this.postForeclosureItem(rowData);
      return insertNewData;

      //1 Record Found, Compare Data
    } else if (res.length === 1) {
      console.log(`Duplicate Data Found`);
      console.log(`Compare Data`);
      const isDataUpdated = this.compareJsonSameKeys(res[0], rowData, [], true);

      //If Not Same Update Data
      if (!isDataUpdated) {
        console.log(`Data not same > Update Data`);
        await this.putForeclosureItem(res[0].id, rowData);
        return 'Update Finish';
      }

      //If Same Quit Function
      return 'Data is Same';

      //If More Than 1 Record, Delete Record
    } else {
      console.log(`More than 1 Record Found`);
    }
  }

  async postForeclosureItem(rowData): Promise<string> {
    const res = await this.db
      .insert(schema.foreclosure)
      .values(rowData)
      .returning({ insertId: schema.foreclosure.id });
    return res[0].insertId;
  }

  async putForeclosureItem(recordID, rowData): Promise<string> {
    const res = await this.db
      .update(schema.foreclosure)
      .set(rowData)
      .where(eq(schema.foreclosure.id, recordID))
      .returning({ updatedId: schema.foreclosure.id });
    return res[0].updatedId;
  }

  async upsertShouldbuyItem(rowData: postshouldbuy): Promise<string> {
    //Fetch Data from DB
    const res = await this.db
      .select()
      .from(schema.shouldbuy)
      .where(
        and(
          eq(schema.shouldbuy.case_number, rowData.case_number),
          eq(schema.shouldbuy.full_address, rowData.full_address),
          eq(schema.shouldbuy.ping, rowData.ping),
          eq(schema.shouldbuy.base_price, rowData.base_price),
          eq(schema.shouldbuy.bid_date, rowData.bid_date),
          eq(schema.shouldbuy.marking, rowData.marking),
          eq(schema.shouldbuy.type, rowData.type),
        ),
      );

    //No Record Found, Insert Data
    if (res.length < 1) {
      console.log(`No Duplicate Data Found Insert Data`);
      const insertNewData = this.postShouldbuyItem(rowData);
      return insertNewData;

      //1 Record Found, Compare Data
    } else if (res.length === 1) {
      console.log(`Duplicate Data Found`);
      console.log(`Compare Data`);
      const isDataUpdated = this.compareJsonSameKeys(res[0], rowData, [], true);

      //If Not Same Update Data
      if (!isDataUpdated) {
        console.log(`Data not same > Update Data`);
        await this.putShouldbuyItem(res[0].id, rowData);
        return 'Update Finish';
      }

      //If Same Quit Function
      return 'Data is Same';

      //If More Than 1 Record, Delete Record
    } else {
      console.log(`More than 1 Record Found`);
    }
  }

  async postShouldbuyItem(rowData: postshouldbuy): Promise<string> {
    const res = await this.db
      .insert(schema.shouldbuy)
      .values(rowData)
      .returning({ insertId: schema.shouldbuy.id });
    return res[0].insertId;
  }

  async putShouldbuyItem(
    recordID: string,
    rowData: postshouldbuy,
  ): Promise<string> {
    const res = await this.db
      .update(schema.shouldbuy)
      .set(rowData)
      .where(eq(schema.foreclosure.id, recordID))
      .returning({ updatedId: schema.shouldbuy.id });
    return res[0].updatedId;
  }

  async upsertBidprice(rowData: postbidprice): Promise<string> {
    //Fetch Data from DB
    const res = await this.db
      .select()
      .from(schema.bidprice)
      .where(
        and(
          eq(schema.bidprice.case_number, rowData.case_number),
          eq(schema.bidprice.full_address, rowData.full_address),
          eq(schema.bidprice.ping, rowData.ping),
          eq(schema.bidprice.item_bid_price, rowData.item_bid_price),
          eq(schema.bidprice.total_bid_price, rowData.total_bid_price),
          eq(
            schema.bidprice.final_total_bid_price,
            rowData.final_total_bid_price,
          ),
          eq(schema.bidprice.bid_date, rowData.bid_date),
        ),
      );

    //No Record Found, Insert Data
    if (res.length < 1) {
      console.log(`No Duplicate Data Found Insert Data`);
      const insertNewData = this.postBidpriceItem(rowData);
      return insertNewData;

      //1 Record Found, Compare Data
    } else if (res.length === 1) {
      console.log(`Duplicate Data Found`);
      console.log(`Compare Data`);
      const isDataUpdated = this.compareJsonSameKeys(res[0], rowData, [], true);

      //If Not Same Update Data
      if (!isDataUpdated) {
        console.log(`Data not same > Update Data`);
        await this.putBidpriceItem(res[0].id, rowData);
        return 'Update Finish';
      }

      //If Same Quit Function
      return 'Data is Same';

      //If More Than 1 Record, Delete Record
    } else {
      console.log(`More than 1 Record Found`);
    }
  }

  async postBidpriceItem(rowData: postbidprice): Promise<string> {
    const res = await this.db
      .insert(schema.bidprice)
      .values(rowData)
      .returning({ insertId: schema.bidprice.id });
    return res[0].insertId;
  }

  async putBidpriceItem(
    recordID: string,
    rowData: postbidprice,
  ): Promise<string> {
    const res = await this.db
      .update(schema.bidprice)
      .set(rowData)
      .where(eq(schema.bidprice.id, recordID))
      .returning({ updatedId: schema.bidprice.id });
    return res[0].updatedId;
  }

  async postImagesPath(
    case_number: postImages['case_number'],
    imagesPath: postImages['images_path'],
  ): Promise<void> {
    try {
      const res = await this.db
        .insert(schema.itemsImages)
        .values({
          case_number: case_number,
          images_path: imagesPath,
        })
        .returning({ insertId: schema.itemsImages.id });
      console.log(`${case_number}: Images Path Incerted: ${res[0].insertId}`);
    } catch (error) {
      console.log(`Can't Incert Images Path: ${error}`);
    }
  }

  //Compare Two Set of Object
  async compareJsonSameKeys(
    orgData,
    newData,
    ignoreKeys = [],
    relaxedMatch = true,
  ) {
    let differences = 0;

    // Helper function for relaxed comparison
    async function relaxedCompare(val1, val2) {
      if (relaxedMatch) {
        // Convert both values to strings
        const str1 = String(val1).trim();
        const str2 = String(val2).trim();

        // If both can be converted to numbers, compare them as numbers
        if (!isNaN(Number(str1)) && !isNaN(Number(str2))) {
          return Math.abs(Number(str1) - Number(str2)) < Number.EPSILON;
        }

        // Otherwise, compare as strings
        return str1 === str2;
      } else {
        // Strict comparison
        return val1 === val2;
      }
    }

    // Iterate over keys that exist in both objects
    for (const key in orgData) {
      // Skip this key if it's in the ignoreKeys array
      if (ignoreKeys.includes(key)) {
        continue;
      }

      if (newData.hasOwnProperty(key)) {
        if (!(await relaxedCompare(orgData[key], newData[key]))) {
          console.log(key);
          differences++;
        }
      }
    }
    if (differences > 0) {
      console.log(`${differences} Difference`);
      return true;
    } else {
      console.log('There are not difference with two data');
      return false;
    }
  }
}
