import { NextRequest } from 'next/server';
import clientPromise from '../lib/mongodb';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get the alias from the URL path
    const alias = request.nextUrl.pathname.substring(1);
    
    const client = await clientPromise;
    const db = client.db('urlshortener');
    const collection = db.collection('urls');

    const urlDoc = await collection.findOne({ alias });
    
    if (!urlDoc) {
      return new Response('URL not found', { status: 404 });
    }

    // Use Response.redirect() for the redirect
    const url = new URL(urlDoc.url);
    return Response.redirect(url);
  } catch (error) {
    console.error('Error in redirect route:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 