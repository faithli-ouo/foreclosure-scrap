import * as Minio from 'minio';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'S3',
      useFactory: async (configService: ConfigService) => {
        const minioClient = new Minio.Client({
          endPoint: configService.get('MINIO_ENDPOINT'),
          port: parseInt(configService.get('MINIO_PORT')),
          useSSL: false,
          accessKey: configService.get('MINIO_ACCESSKEY'),
          secretKey: configService.get('MINIO_SECRETKEY'),
        });
        console.log(minioClient);
        return minioClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3'],
})
export class S3Module {}
