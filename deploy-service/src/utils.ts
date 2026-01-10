import { exec } from "child_process";
import path from "path";

export function buildProject(id: string) {
    return new Promise((resolve) => {
        const child = exec(`npm install && npm run build`, {
            cwd: path.join(__dirname, `output/${id}`)
        });

        child.stdout?.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function (code) {
            resolve("")
        });
    })
}
