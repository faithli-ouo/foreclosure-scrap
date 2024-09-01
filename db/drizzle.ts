import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env' }); // or .env.local

const connection: string = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`;

const sql = postgres(connection, {
  onnotice: () => {},
  debug: (connection, query, params) => {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
  },
});

export const db = drizzle(sql);
