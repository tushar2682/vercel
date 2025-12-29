import fs from 'fs';
import path from 'path';

export const getallFiles = (FolderPath: string): string[] => {
    let Response: string[] = [];
    const allfilesandfolder=fs.readdirSync(FolderPath);
    allfilesandfolder.forEach((fileorfolder)=>{
        const fullpath=path.join(FolderPath,fileorfolder);
       if(fs.statSync(fullpath).isDirectory()){
        Response=Response.concat(getallFiles(fullpath));
       } else {
        Response.push(fullpath);
       }    
    });
    return Response;
}