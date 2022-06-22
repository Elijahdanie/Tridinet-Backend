import S3 from 'aws-sdk/clients/s3';
import {config} from 'dotenv'
import fs from 'fs';


config();
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
    });
 
export async function uploadFile(file, filename): Promise<S3.ManagedUpload.SendData> {
    console.log(s3)
    const fileStream = fs.createReadStream(file);

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: fileStream
        };

        return s3.upload(params).promise();
}

export function downLoadFile(url)
{
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: url
    };

    return s3.getObject(params).createReadStream();
}

export function deleteFile(url)
{
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: url
    };

    return s3.deleteObject(params).promise();
}
