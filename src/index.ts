import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { generate } from './utils.js';
import { getallFiles } from './file.js';
import { fileURLToPath } from 'url';
import { uploadfile } from './path.js';
import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });
await publisher.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

interface DeployRequestBody {
  repoUrl: string;
}

app.post('/deploy', async (req: Request<{}, {}, DeployRequestBody>, res: Response) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    const id = generate();
    const outputDir = path.join(__dirname, `outputs/${id}`);

    // Create directory
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (mkdirErr) {
      console.error('Error creating directory:', mkdirErr);
      return res.status(500).json({ error: 'Failed to create output directory' });
    }

    // Clone repo
    try {
      const git = simpleGit();
      await git.clone(repoUrl, outputDir);
    } catch (cloneErr) {
      console.error('Git clone error:', cloneErr);
      const errorMessage = cloneErr instanceof Error ? cloneErr.message : 'Unknown error';
      return res.status(500).json({ error: 'Git clone failed', details: errorMessage, repoUrl });
    }

    // Get files and upload
    let files;
    try {
      files = getallFiles(outputDir);
    } catch (filesErr) {
      console.error('Error getting files:', filesErr);
      return res.status(500).json({ error: 'Failed to process files' });
    }

    try {
      await Promise.all(files.map(file => uploadfile(file, file.slice(__dirname.length + 1))
        .catch(uploadErr => console.error(`Error uploading ${file}:`, uploadErr))
      ));
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      // Don't return error here, just log and continue
    }

    await publisher.lPush("build-queue", id);
    return res.json({ id, message: 'Deployment initiated', repoUrl, directory: outputDir });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});