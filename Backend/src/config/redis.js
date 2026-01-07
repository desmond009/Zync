import Redis from 'ioredis';

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
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
        console.error('❌ Redis connection error:', error);
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      RedisClient.instance = this;
    }

    return RedisClient.instance;
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
