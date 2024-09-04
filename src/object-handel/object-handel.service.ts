import { Injectable, Inject } from '@nestjs/common';
import * as sharp from 'sharp';

const BucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        AWS: ['*'],
      },
      Action: ['s3:GetBucketLocation', 's3:ListBucket'],
      Resource: ['arn:aws:s3:::*'],
    },
    {
      Effect: 'Allow',
      Principal: {
        AWS: ['*'],
      },
      Action: ['s3:GetObject'],
      Resource: ['arn:aws:s3:::*/*'],
    },
  ],
};

@Injectable()
export class ObjectHandelService {
  constructor(@Inject('S3') private readonly S3) {}

  async findBucket(case_number: string): Promise<boolean> {
    const bucket = case_number;
    const exists = await this.S3.bucketExists(bucket);
    if (exists) {
      console.log('Bucket: ' + bucket + ' exists.');
      return true;
    } else {
      console.log('Bucket ' + bucket + ' created.');
      await this.S3.makeBucket(bucket, 'us-east-1');
      await this.S3.setBucketPolicy(bucket, JSON.stringify(BucketPolicy));
      return false;
    }
  }

  async fetchOpUploadImages(
    imageSrc: string,
    bucketName: string,
  ): Promise<string> {
    const response = await fetch(imageSrc);
    const FullUrl: string[] = imageSrc.match(/\/([^\/]+)\.*$/);
    const fileName: string = FullUrl[1].split('.')[0] + '.webp';

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Get the image as a buffer
    const imageBuffer: ArrayBuffer = await response.arrayBuffer();
    // Convert to WebP using sharp
    const webpBuffer: Buffer = await sharp(imageBuffer)
      .webp({ quality: 60 })
      .toBuffer();

    await this.S3.putObject(
      bucketName,
      fileName,
      webpBuffer,
      webpBuffer.length,
      { 'Content-Type': 'image/webp' },
    );
    // console.log(await this.S3.fPutObject(bucketName, bucketName, webpBuffer));
    console.log(`Image uploaded`);
    return fileName;
  }
}
