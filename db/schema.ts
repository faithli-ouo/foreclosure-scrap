import {
  integer,
  pgTable,
  boolean,
  timestamp,
  text,
  bigint,
  real,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const foreclosure = pgTable('foreclosure', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  case_number: text('case_number').notNull(),
  type: text('type').notNull(),
  court: text('court').notNull(),
  year: integer('year').notNull(),
  zhcode: text('zhcode').notNull(),
  stock: text('stock').notNull(),
  bid_date: timestamp('bid_date').notNull(),
  bid_times: integer('bid_times').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  full_address: text('full_address').notNull(),
  ratio: text('ratio').notNull(),
  ping: integer('ping').notNull(),
  square_meter: real('square_meter').notNull(),
  base_price: bigint('base_price', { mode: 'number' }).notNull(),
  total_base_price: bigint('total_base_price', { mode: 'number' }).notNull(),
  handover: text('handover').notNull(),
  empty: text('empty').notNull(),
  is_unregistered_building: boolean('is_unregistered_building')
    .default(false)
    .notNull(),
  marking: text('marking').notNull(),
  remark: text('remark'),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});
