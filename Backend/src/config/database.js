import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
class DatabaseClient {
  constructor() {
    if (!DatabaseClient.instance) {
      this.prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
        errorFormat: 'pretty',
      });

      // Middleware for soft delete
      this.prisma.$use(async (params, next) => {
        // Check if the operation is a findUnique or findFirst
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where = {
            ...params.args.where,
            deletedAt: null,
          };
        }

        // Check if the operation is a findMany
        if (params.action === 'findMany') {
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where.deletedAt = null;
            }
          } else {
            params.args.where = { deletedAt: null };
          }
        }

        // Check if the operation is a delete
        if (params.action === 'delete') {
          params.action = 'update';
          params.args.data = { deletedAt: new Date() };
        }

        // Check if the operation is a deleteMany
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data.deletedAt = new Date();
          } else {
            params.args.data = { deletedAt: new Date() };
          }
        }

        return next(params);
      });

      DatabaseClient.instance = this;
    }

    return DatabaseClient.instance;
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  getClient() {
    return this.prisma;
  }
}

const databaseClient = new DatabaseClient();
export const prisma = databaseClient.getClient();
export default databaseClient;
