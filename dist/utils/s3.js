"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.downLoadFile = exports.uploadFile = void 0;
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
(0, dotenv_1.config)();
const s3 = new s3_1.default({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
});
async function uploadFile(file, filename) {
    console.log(s3);
    const fileStream = fs_1.default.createReadStream(file);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: fileStream
    };
    return s3.upload(params).promise();
}
exports.uploadFile = uploadFile;
function downLoadFile(url) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: url
    };
    return s3.getObject(params).createReadStream();
}
exports.downLoadFile = downLoadFile;
function deleteFile(url) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: url
    };
    return s3.deleteObject(params).promise();
}
exports.deleteFile = deleteFile;
