import Redis from 'ioredis';

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        maxRetriesPerRequest: 3,
        // When disconnected, queue commands (default true)
        // Set to false if you want commands to fail fast when disconnected
        enableOfflineQueue: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      };

      // Add authentication only if credentials are provided
      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
        if (process.env.REDIS_USERNAME) {
          redisConfig.username = process.env.REDIS_USERNAME;
        }
      }

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.client.on('error', (error) => {
        // Suppress default error logging for connection refusal to avoid noise
        // explicit handling in connect() will show a better message
        if (error.code === 'ECONNREFUSED') {
          // console.error('❌ Redis connection refused');
        } else {
          console.error('❌ Redis connection error:', error);
        }
      });

      this.client.on('reconnecting', () => {
        // console.log('🔄 Redis reconnecting...');
      });

      RedisClient.instance = this;
    }

    return RedisClient.instance;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      // If already connected
      if (this.client.status === 'ready') {
        return resolve();
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Redis connection timeout: Failed to connect to ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`));
      }, 5000); // 5 second timeout

      const onReady = () => {
        clearTimeout(timeout);
        this.client.removeListener('error', onError);
        resolve();
      };

      const onError = (err) => {
        if (err.code === 'ECONNREFUSED') {
          clearTimeout(timeout);
          this.client.removeListener('ready', onReady);
          console.error('\n\x1b[31m%s\x1b[0m', '────────────────────────────────────────────────────');
          console.error('\x1b[31m%s\x1b[0m', '🚨 REDIS CONNECTION FAILED');
          console.error('\x1b[33m%s\x1b[0m', `   Could not connect to Redis at ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
          console.error('\x1b[33m%s\x1b[0m', '   Please make sure Redis is installed and running.');
          console.error('\x1b[90m%s\x1b[0m', '   Run: redis-server');
          console.error('\x1b[31m%s\x1b[0m', '────────────────────────────────────────────────────\n');
          reject(new Error('Redis connection failed'));
        }
      };

      this.client.once('ready', onReady);
      this.client.on('error', onError);
    });
  }

  getClient() {
    return this.client;
  }

  async set(key, value, expiryInSeconds = null) {
    try {
      if (expiryInSeconds) {
        await this.client.set(key, JSON.stringify(value), 'EX', expiryInSeconds);
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async disconnect() {
    await this.client.quit();
    console.log('🔌 Redis disconnected');
  }
}

const redisClient = new RedisClient();
export default redisClient;
