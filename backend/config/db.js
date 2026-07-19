import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (attempt = 1) => {
    try {
        await mongoose.connect(env.MONGO_URL, {
            maxPoolSize: 20, // connection pool - important once you scale to multiple instances
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB connection attempt ${attempt} failed: ${err.message}`);

        if (attempt >= MAX_RETRIES) {
            console.error('❌ Exhausted retries connecting to MongoDB. Exiting.');
            throw err;
        }

        await wait(RETRY_DELAY_MS * attempt); // simple backoff
        return connectDB(attempt + 1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

export default connectDB;
