import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const diagnostics = async () => {
    console.log('🔍 Backend Diagnostics\n');
    
    // 1. Check environment
    console.log('1️⃣  Environment Check:');
    console.log('   MONGO_URL:', process.env.MONGO_URL ? '✅ Set' : '❌ NOT SET');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');
    console.log('   PORT:', process.env.PORT || '3000');
    
    // 2. Test MongoDB connection
    console.log('\n2️⃣  MongoDB Connection Test:');
    if (!process.env.MONGO_URL) {
        console.log('   ❌ MONGO_URL not found - running in memory mode');
        process.exit(0);
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('   ✅ Connected to MongoDB');
        
        // Get database stats
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\n   Collections:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`   - ${col.name}: ${count} documents`);
        }
        
        // Check User collection specifically
        const users = await db.collection('users').find({}).toArray();
        console.log(`\n   👥 Users in database: ${users.length}`);
        if (users.length > 0) {
            console.log('   Sample users:');
            users.slice(0, 3).forEach(u => {
                console.log(`   - ${u.name} (${u.email})`);
            });
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Diagnostics complete!');
        process.exit(0);
    } catch (err) {
        console.log(`   ❌ Connection failed: ${err.message}`);
        console.log('\n💡 Possible causes:');
        console.log('   - MongoDB Atlas IP whitelist not configured');
        console.log('   - Invalid connection string');
        console.log('   - Network timeout');
        console.log('   - MongoDB cluster down');
        process.exit(1);
    }
};

diagnostics();
