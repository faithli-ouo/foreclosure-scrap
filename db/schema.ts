import {
  integer,
  pgTable,
  boolean,
  timestamp,
  text,
  bigint,
  real,
} from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// type export
export type postforeclosure = InferInsertModel<typeof foreclosure>;
export type postshouldbuy = InferInsertModel<typeof shouldbuy>;
export type postImages = InferInsertModel<typeof itemsImages>;
export type postbidprice = InferInsertModel<typeof bidprice>;

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
  is_unregistered_building: boolean('is_unregistered_building').notNull(),
  marking: text('marking').notNull(),
  remark: text('remark').notNull(),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});

export const shouldbuy = pgTable('shouldbuy', {
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
  is_unregistered_building: boolean('is_unregistered_building').notNull(),
  marking: text('marking').notNull(),
  remark: text('remark').notNull(),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});

export const bidprice = pgTable('bidprice', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  case_number: text('case_number').notNull(),
  court: text('court').notNull(),
  year: integer('year').notNull(),
  zhcode: text('zhcode').notNull(),
  stock: text('stock').notNull(),
  bid_date: timestamp('bid_date').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  full_address: text('full_address').notNull(),
  ratio: text('ratio').notNull(),
  ping: integer('ping').notNull(),
  square_meter: real('square_meter').notNull(),
  item_bid_price: bigint('item_bid_price', { mode: 'number' }).notNull(),
  total_bid_price: bigint('total_bid_price', { mode: 'number' }).notNull(),
  final_total_bid_price: bigint('final_total_bid_price', {
    mode: 'number',
  }).notNull(),
  price_diff: real('price_diff').notNull(),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});

export const itemsImages = pgTable('itemsImages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  case_number: text('case_number').notNull(),
  images_path: text('images_path').array().notNull(),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});
