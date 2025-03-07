import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {

  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'auth_db';


export const connectDB = async () => {

  try {

    if (mongoose.connection.readyState === 0) {

      await mongoose.connect(MONGODB_URI, {
        dbName: MONGODB_DB,
      });

      console.log('Connected to MongoDB Database:', MONGODB_DB);
    }

  } catch (error) {
    
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};