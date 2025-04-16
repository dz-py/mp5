import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MongoClient } from 'mongodb';

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  alias: z.string().min(1, 'Alias is required').max(50, 'Alias is too long'),
});

export async function POST(request: Request) {
  let client: MongoClient | null = null;
  
  try {
    const body = await request.json();
    const { url, alias } = urlSchema.parse(body);

    // Get MongoDB client
    try {
      if (!process.env.MONGO_URI) {
        throw new Error('MongoDB URI is not defined');
      }
      
      // Create a new client with no options
      client = new MongoClient(process.env.MONGO_URI);
      console.log('Attempting to connect to MongoDB...');
      await client.connect();
      console.log('Successfully connected to MongoDB');
      
      const db = client.db('urlshortener');
      const collection = db.collection('urls');

      // Check if alias already exists
      const existingUrl = await collection.findOne({ alias });
      if (existingUrl) {
        return NextResponse.json(
          { error: 'Alias already taken' },
          { status: 400 }
        );
      }

      // Insert new URL
      await collection.insertOne({
        url,
        alias,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${alias}`,
      });
    } catch (connectionError) {
      console.error('MongoDB connection error:', connectionError);
      
      // Check for specific error types
      if (connectionError instanceof Error) {
        if (connectionError.message.includes('tlsv1 alert internal error') || 
            connectionError.message.includes('SSL') || 
            connectionError.message.includes('TLS')) {
          return NextResponse.json(
            { error: 'SSL/TLS connection error. Please contact support.' },
            { status: 503 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Always close the client connection
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