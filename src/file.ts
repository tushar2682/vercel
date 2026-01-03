import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';


export const getallFiles = (FolderPath: string): string[] => {
    let Response: string[] = [];
    const files = getallFiles(FolderPath);

    const allfilesandfolder=fs.readdirSync(FolderPath);
    allfilesandfolder.forEach((fileorfolder)=>{
        const fullpath=path.join(FolderPath,fileorfolder);
       if(fs.statSync(fullpath).isDirectory()){
        Response=Response.concat(getallFiles(fullpath));
        files.forEach(file=>{
            S3.upload(file);
        })
        

       } else {
        Response.push(fullpath);
       }    
    });
    return Response;
}