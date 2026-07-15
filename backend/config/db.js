import mongoose from 'mongoose';

const connectDB = async () => {
    if (!process.env.MONGO_URL) {
        console.warn('⚠️  MongoDB URL not configured. Running in MEMORY MODE (data will be lost on restart).');
        return false;
    }

    try {
        // Ensure proper error handling
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
        });
        
        console.log('✅ MongoDB Connected Successfully');
        console.log(`   Database: ${connection.connection.db.databaseName}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.warn('⚠️  Falling back to MEMORY MODE - data WILL BE LOST on server restart!');
        console.warn('   Please check your MONGO_URL and MongoDB Atlas configuration.');
        return false;
    }
};

export default connectDB;
