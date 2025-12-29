import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { generate } from './utils.js';

const app = express();

app.use(cors());
app.use(express.json());

interface DeployRequestBody {
  repoUrl: string;
}

app.post(
  '/deploy',
  async (req: Request<{}, {}, DeployRequestBody>, res: Response) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }
    const id = generate();

    const outputDir = path.join('outputs', Date.now().toString());
    fs.mkdirSync(outputDir, { recursive: true });

    try {
      const git = simpleGit();
      await git.clone(repoUrl, outputDir);

      return res.json({
        message: 'Deployment initiated',
        repoUrl,
        directory: outputDir
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Git clone failed' });
    }
  }
);

app.listen(3000, () => {
  console.log(' Server running on port 3000');
});
