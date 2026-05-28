import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

let redisConnection: IORedis | null = null;
let bullQueue: Queue | null = null;
export let isRedisFallbackMode = false;

// Mock Queue class for in-memory processing
class InMemoryQueue {
  name: string;
  private jobs: Map<string, { id: string; name: string; data: any }> = new Map();

  constructor(name: string) {
    this.name = name;
    console.log(`🚀 In-Memory Queue [${name}] initialized.`);
  }

  async add(name: string, data: any): Promise<any> {
    const jobId = Math.random().toString(36).substring(7);
    const job = { id: jobId, name, data };
    this.jobs.set(jobId, job);

    console.log(`[Queue: ${this.name}] Job added: ${jobId} - ${name}`);

    // Asynchronously execute the worker simulation
    // We import worker logic dynamically to avoid circular dependencies
    setTimeout(async () => {
      try {
        const { processGenerationJob } = require('../workers/generation.worker');
        await processGenerationJob({ id: jobId, name, data });
      } catch (err) {
        console.error('Error running in-memory worker job:', err);
      }
    }, 1000);

    return job;
  }
}

export const initQueue = () => {
  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');

  try {
    // Try to connect to Redis
    redisConnection = new IORedis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      connectTimeout: 2000 // fail fast if not running
    });

    redisConnection.on('error', (err) => {
      if (!isRedisFallbackMode) {
        console.log(`⚠️  Redis Connection Error: ${err.message}. Falling back to In-Memory Queue.`);
        isRedisFallbackMode = true;
      }
    });

    redisConnection.on('connect', () => {
      console.log('✅ Connected to Redis.');
    });

    bullQueue = new Queue('assignment-generation', {
      connection: redisConnection as any
    });

  } catch (error: any) {
    console.log('⚠️  Failed to create Redis connection. Falling back to In-Memory Queue.');
    isRedisFallbackMode = true;
  }
};

export const getQueue = (): { add: (name: string, data: any) => Promise<any> } => {
  if (isRedisFallbackMode || !bullQueue) {
    // Return mock queue
    return new InMemoryQueue('assignment-generation-mock') as any;
  }
  return bullQueue;
};
