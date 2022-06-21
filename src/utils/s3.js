const S3 = require('aws-sdk/clients/s3'); 
require('dotenv').config();
const fs = require('fs');

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
    });
 
export function uploadFile(file){
    const fileStream = fs.createReadStream(file);

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.name,
            Body: file.data
        };

        return s3.upload(params).promise();
}

module.exports = uploadFile;
