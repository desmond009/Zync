import mongoose from 'mongoose';

// Singleton pattern for MongoDB connection
class DatabaseClient {
  constructor() {
    if (!DatabaseClient.instance) {
      this.mongoose = mongoose;
      this.isConnected = false;
      DatabaseClient.instance = this;
    }
    return DatabaseClient.instance;
  }

  async connect() {
    if (this.isConnected) {
      console.log('✅ Using existing database connection');
      return;
    }

    try {
      const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(process.env.DATABASE_URL, options);

      this.isConnected = true;
      console.log('✅ Database connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 Database disconnected');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) return false;
      
      const adminDb = mongoose.connection.db.admin();
      await adminDb.ping();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

const databaseClient = new DatabaseClient();
export default databaseClient;

