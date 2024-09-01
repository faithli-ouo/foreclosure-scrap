import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import postgres = require('postgres');

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'DRIZZLE_ORM',
      useFactory: async (configService: ConfigService) => {
        const connection = `postgres://${configService.get('PG_USER')}:${configService.get('PG_PASSWORD')}@${configService.get('PG_HOST')}:${configService.get('PG_PORT')}/${configService.get('PG_DB')}`;
        const sql = postgres(connection, {
          onnotice: () => {},
          // debug: (connection, query, params) => {
          //   console.log('SQL Query:', query);
          //   console.log('Parameters:', params);
          // },
        });

        return drizzle(sql);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_ORM'],
})
export class DrizzleModule {}
