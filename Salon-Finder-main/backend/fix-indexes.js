/**
 * Fix MongoDB Indexes Script v2
 * Drops ALL indexes and recreates only the needed ones
 * Run with: node fix-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-booking';

const fixIndexes = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.collection('salons');

        // First, list all current indexes
        console.log('\n📋 Current indexes:');
        const currentIndexes = await collection.indexes();
        currentIndexes.forEach(idx => {
            console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop ALL indexes except _id
        console.log('\n🗑️  Dropping all indexes except _id...');
        for (const idx of currentIndexes) {
            if (idx.name !== '_id_') {
                try {
                    await collection.dropIndex(idx.name);
                    console.log(`   Dropped: ${idx.name}`);
                } catch (e) {
                    console.log(`   Could not drop ${idx.name}: ${e.message}`);
                }
            }
        }

        // Wait a moment for indexes to be fully dropped
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create ONLY the 2dsphere index on location field (not coordinates)
        console.log('\n📍 Creating single 2dsphere index on location field...');
        await collection.createIndex(
            { 'location': '2dsphere' },
            { name: 'location_2dsphere_single' }
        );
        console.log('   ✅ Created location_2dsphere_single');

        // Create text index for search
        console.log('\n📝 Creating text index for search...');
        await collection.createIndex(
            { name: 'text', description: 'text' },
            { name: 'text_search' }
        );
        console.log('   ✅ Created text_search');

        // List final indexes
        console.log('\n📋 Final indexes on salons collection:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(idx => {
            console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n🎉 Indexes fixed successfully!');
        console.log('Please restart the backend server (npm run dev)');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
};

fixIndexes();
