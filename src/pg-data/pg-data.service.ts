import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from 'db/schema'; // Ensure this path is correct

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class PGDataService {
  constructor(@Inject('DRIZZLE_ORM') private readonly db: DrizzleDB) {}
  async postForeclosureItem(rowData): Promise<string> {
    console.log(rowData);
    if (!rowData) {
      console.error('rowData is undefined or null');
      return;
    }
    const res = await this.db
      .insert(schema.foreclosure)
      .values(rowData)
      .returning({ insertId: schema.foreclosure.id });
    return res[0].insertId;
  }
}
