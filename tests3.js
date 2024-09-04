import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: '192.168.0.179',
  port: 5002,
  useSSL: false,
  accessKey: 'ULbjsHSkvwMsdvtGX8fT',
  secretKey: 'LvGGGn5pT1MuuIAgLDTzZMx5qVEKc32ZNuCoKZyL',
});

// File to upload
// const sourceFile =
//   'C:/Users/Faith/Desktop/code/Nestjs/Housing_standalone/cover.png';

// // Destination bucket
// const bucket = 'testing';

// // Destination object name
// const destinationObject = 'cover.png';

// Check if the bucket exists
// If it doesn't, create it

// const exists = await minioClient.bucketExists(bucket);
// if (exists) {
//   console.log('Bucket ' + bucket + ' exists.');
// } else {
//   await minioClient.makeBucket(bucket, 'us-east-1');
//   console.log('Bucket ' + bucket + ' created in "us-east-1".');
// }

// // Set the object metadata
// var metaData = {
//   'Content-Type': 'text/plain',
//   'X-Amz-Meta-Testing': 1234,
//   example: 5678,
// };

// Upload the file with fPutObject
// If an object with the same name exists,
// it is updated with new data

// await minioClient.fPutObject(bucket, destinationObject, sourceFile);
// console.log(
//   'File ' +
//     sourceFile +
//     ' uploaded as object ' +
//     destinationObject +
//     ' in bucket ' +
//     bucket,
// );

function getFullAccessPolicy(bucketName) {
  return {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket"
        ],
        "Resource": `arn:aws:s3:::${bucketName}`
      },
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "s3:ListBucketMultipartUploads",
          "s3:ListBucketVersions",
          "s3:ListMultipartUploadParts"
        ],
        "Resource": `arn:aws:s3:::${bucketName}`
      },
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:DeleteObjectVersion",
          "s3:GetObjectVersion"
        ],
        "Resource": `arn:aws:s3:::${bucketName}/*`
      }
    ]
  };
}

async function manageBuckets() {
  try {
    const buckets = await minioClient.listBuckets();
    console.log('Buckets:');
    buckets.forEach(bucket => console.log(bucket.name));

    for (const bucket of buckets) {
      const bucketName = bucket.name;
      console.log(`Setting full access policy for bucket: ${bucketName}`);

      const policy = getFullAccessPolicy(bucketName);
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Policy set for bucket: ${bucketName}`);

      console.log(`Attempting to delete all objects in bucket: ${bucketName}`);
      
      try {
        const objectsStream = minioClient.listObjects(bucketName, '', true);

        const deleteObjects = [];
        for await (const obj of objectsStream) {
          deleteObjects.push(obj.name);
        }

        if (deleteObjects.length > 0) {
          await minioClient.removeObjects(bucketName, deleteObjects);
          console.log(`All objects deleted from bucket: ${bucketName}`);
        }

        await minioClient.removeBucket(bucketName);
        console.log(`Bucket ${bucketName} deleted.`);
      } catch (err) {
        console.error(`Failed to process bucket ${bucketName}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Error managing buckets:', error);
  }
}

manageBuckets();
