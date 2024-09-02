import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: '192.168.0.179',
  port: 5002,
  useSSL: false,
  accessKey: 'ULbjsHSkvwMsdvtGX8fT',
  secretKey: 'LvGGGn5pT1MuuIAgLDTzZMx5qVEKc32ZNuCoKZyL',
});

// File to upload
const sourceFile =
  'C:/Users/Faith/Desktop/code/Nestjs/Housing_standalone/cover.png';

// Destination bucket
const bucket = 'testing';

// Destination object name
const destinationObject = 'cover.png';

// Check if the bucket exists
// If it doesn't, create it
const exists = await minioClient.bucketExists(bucket);
if (exists) {
  console.log('Bucket ' + bucket + ' exists.');
} else {
  await minioClient.makeBucket(bucket, 'us-east-1');
  console.log('Bucket ' + bucket + ' created in "us-east-1".');
}

// // Set the object metadata
// var metaData = {
//   'Content-Type': 'text/plain',
//   'X-Amz-Meta-Testing': 1234,
//   example: 5678,
// };

// Upload the file with fPutObject
// If an object with the same name exists,
// it is updated with new data
await minioClient.fPutObject(bucket, destinationObject, sourceFile);
console.log(
  'File ' +
    sourceFile +
    ' uploaded as object ' +
    destinationObject +
    ' in bucket ' +
    bucket,
);
