import fs from 'fs';
export const getallFiles = (FolderPath) => {
    const allfilesandfolder = fs.readdirSync(FolderPath);
    allfilesandfolder.forEach((fileorfolder) => {
        const fullpath = path.join(FolderPath, fileorfolder);
        const stat = fs.lstatSync(fullpath);
    });
};
