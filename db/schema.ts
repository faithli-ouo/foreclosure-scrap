import {
  numeric,
  pgTable,
  boolean,
  timestamp,
  text,
  real,
} from 'drizzle-orm/pg-core';

export const foreclosure = pgTable('foreclosure', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  case_number: text('case_number').notNull(),
  type: text('type').notNull(),
  court: text('court').notNull(),
  year: numeric('year').notNull(),
  zhcode: text('zhcode').notNull(),
  stock: text('stock').notNull(),
  bid_date: timestamp('bid_date', { withTimezone: true }).notNull(),
  bid_times: numeric('bid_times').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  full_address: text('full_address').notNull(),
  ratio: text('ratio').notNull(),
  ping: numeric('ping').notNull(),
  square_meter: real('square_meter').notNull(),
  base_price: numeric('base_price').notNull(),
  total_base_price: numeric('total_base_price').notNull(),
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
