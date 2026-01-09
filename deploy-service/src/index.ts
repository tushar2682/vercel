import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.on('error', (err) => console.log('Redis Client Error', err));

let isShuttingDown = false;

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    isShuttingDown = true;
    subscriber.quit();
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    isShuttingDown = true;
    subscriber.quit();
});

async function processBuildJob(id: string) {
    try {
        console.log(`Processing build job: ${id}`);

        // Download project files from S3
        await downloadS3Folder(id);

        // Build the project
        await buildProject(id);

        // Upload built files back to S3
        await copyFinalDist(id);

        console.log(`Build job ${id} completed successfully`);
    } catch (error) {
        console.error(`Error processing build job ${id}:`, error);
        // Dont throw, just log.
    }
}

async function main() {
    try {
        await subscriber.connect();
        console.log('Connected to Redis, waiting for build jobs...');

        while (!isShuttingDown) {
            try {
                // @ts-ignore
                const res = await subscriber.brPop('build-queue', 0);

                if (res) {
                    // @ts-ignore
                    const id = res.element || res[1]; // Handle different return shapes
                    await processBuildJob(id as string);
                }
            } catch (error) {
                console.error('Error in main loop:', error);

                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        console.log('Disconnecting from Redis...');
        if (subscriber.isOpen) await subscriber.disconnect();
        console.log('Shutdown complete');
    }
}

main().catch(error => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
});