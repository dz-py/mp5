import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  let client: MongoClient | null = null;
  
  try {
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI is not defined' },
        { status: 500 }
      );
    }
    
    console.log('Test DB - MongoDB URI format:', process.env.MONGO_URI.substring(0, 20) + '...');
    
    // Create a new client with no options
    client = new MongoClient(process.env.MONGO_URI);
    
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Try to list databases to verify connection
    const adminDb = client.db('admin');
    // Use the admin command to list databases
    const result = await adminDb.command({ listDatabases: 1 });
    const dbList = result.databases || [];
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      databases: dbList.map((db: { name: string }) => db.name)
    });
  } catch (error) {
    console.error('MongoDB connection error in test route:', error);
    
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('MongoDB connection closed');
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
} 