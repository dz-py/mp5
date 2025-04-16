// Simple script to test MongoDB connection
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.production' });

async function testConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB URI is not defined in environment variables');
    process.exit(1);
  }

  console.log('MongoDB URI format:', uri.substring(0, 20) + '...');
  
  // Create a new client with no options
  const client = new MongoClient(uri);

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Try to list databases to verify connection
    const adminDb = client.db('admin');
    const result = await adminDb.command({ listDatabases: 1 });
    const dbList = result.databases || [];
    
    console.log('Available databases:');
    dbList.forEach(db => console.log(`- ${db.name}`));
    
    // Try to access the urlshortener database
    const db = client.db('urlshortener');
    const collection = db.collection('urls');
    
    // Count documents
    const count = await collection.countDocuments();
    console.log(`Number of documents in 'urls' collection: ${count}`);
    
    console.log('MongoDB connection test successful!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testConnection().catch(console.error); 