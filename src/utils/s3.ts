import S3 from 'aws-sdk/clients/s3';
import {config} from 'dotenv'
import fs from 'fs';

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
    });
 
export default function uploadFile(file){
    const fileStream = fs.createReadStream(file);

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.filename,
            Body: fileStream
        };

        return s3.upload(params).promise();
}
