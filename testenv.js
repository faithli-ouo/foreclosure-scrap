import { config } from 'dotenv';
import { db } from './db/drizzle';
import { foreclosure } from './db/schema';

const data = {
  case_number: 'A123456789',
  type: 'Foreclosure',
  court: 'Taipei District Court',
  year: 2024,
  zhcode: 'XYZ789',
  stock: 'Residential',
  bid_date: '2024-09-15',
  bid_times: 2,
  country: 'Taiwan',
  city: 'Taipei',
  address: '123 Zhongshan Road',
  full_address: '123 Zhongshan Road, Taipei, Taiwan 100',
  ratio: '1:1',
  ping: 35,
  square_meter: 115.7,
  base_price: 15000000,
  total_base_price: 30000000,
  handover: 'Immediate',
  empty: 'Yes',
  is_unregistered_building: false,
  marking: 'Auction',
  remark: 'None',
};

const res = await db
  .insert(foreclosure)
  .values(data)
  .returning({ insertId: foreclosure.id });

console.log(res);
