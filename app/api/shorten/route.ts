import { NextResponse } from 'next/server';
import { z } from 'zod';
import clientPromise from '../../../lib/mongodb';

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  alias: z.string().min(1, 'Alias is required').max(50, 'Alias is too long'),
});

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { url, alias } = urlSchema.parse(body);

    client = await clientPromise;
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
  }
} 