import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGO_URI;
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 10000,  // 10 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  maxPoolSize: 1,
  retryWrites: true,
  retryReads: true,
  w: 'majority' as const,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  tlsInsecure: false,
  // Explicitly set TLS version
  tlsCAFile: undefined,
  tlsCertificateKeyFile: undefined,
  tlsCertificateKeyFilePassword: undefined,
  // Use Node.js native TLS
  useNewUrlParser: true,
  useUnifiedTopology: true
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 