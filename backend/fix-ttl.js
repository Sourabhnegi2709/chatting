import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const fixTTLIssue = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.log('❌ MONGO_URL not found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Connected to MongoDB');

        // Get the User collection
        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // List all indexes
        const indexes = await collection.listIndexes().toArray();
        console.log('\n📋 Current indexes on User collection:');
        console.log(JSON.stringify(indexes, null, 2));

        // Find and remove TTL indexes
        let found = false;
        for (const indexData of indexes) {
            if (indexData.expireAfterSeconds !== undefined) {
                const indexName = indexData.name;
                console.log(`\n⚠️  Found TTL index: ${indexName}`);
                console.log(`   Expires after: ${indexData.expireAfterSeconds} seconds`);
                console.log(`   Dropping index: ${indexName}`);
                await collection.dropIndex(indexName);
                console.log(`✅ Dropped TTL index: ${indexName}`);
                found = true;
            }
        }

        if (!found) {
            console.log('\n✅ No TTL indexes found - collection is safe!');
        }

        console.log('\n✅ Fix completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

fixTTLIssue();
