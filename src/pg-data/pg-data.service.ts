import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from 'db/schema'; // Ensure this path is correct
import { eq, and, count, gte } from 'drizzle-orm';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class PGDataService {
  constructor(@Inject('DRIZZLE_ORM') private readonly db: DrizzleDB) {}
  async upsertForeclosureItem(rowData): Promise<unknown> {
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
      if (isDataUpdated) {
        console.log(`update data`);
        return await this.putForeclosureItem(res[0].id, rowData);
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
