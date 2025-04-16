import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Parse the MongoDB URI to ensure it's properly formatted
const uri = process.env.MONGO_URI;
console.log('MongoDB URI format:', uri.substring(0, 20) + '...');

// Create a new client for each request
export async function getMongoClient() {
  // Create a new client with minimal options
  const client = new MongoClient(uri);
  return client;
}

// For development mode, use a global variable
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each request
  clientPromise = Promise.resolve(null as unknown as MongoClient);
}

// Export the appropriate client promise
export default clientPromise; 