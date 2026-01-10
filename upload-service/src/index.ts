
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); // asd12
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    const uploadPromises = files.map(async file => {
        await uploadFile(file.slice(__dirname.length + 1).replace(/\\/g, "/"), file);
    });
    await Promise.all(uploadPromises);

    // Put this to redis
    await publisher.lPush("build-queue", id);
    // 

    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id
    });
});

app.get("/status", async (req, res) => {
    const id = req.query.id as string;
    const response = await publisher.hGet("status", id);
    res.json({
        status: response
    })
})

app.listen(3000);
