import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3=new S3(
    {
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
        region:process.env.AWS_REGION
    });
    export const uploadfile=async(filePath:string,bucketName:string)=>{
        const fileContent=fs.readFileSync(filePath);
        const params={
            Bucket:bucketName,
            Key:filePath,
            Body:fileContent
        };
        await s3.upload(params).promise();
    };
