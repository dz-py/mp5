import clientPromise from '../lib/mongodb';
import { NextRequest } from 'next/server';

type Props = {
  params: {
    alias: string;
  };
};

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    // Get the alias from the params
    const { alias } = props.params;
    
    const client = await clientPromise;
    const db = client.db('urlshortener');
    const collection = db.collection('urls');

    const urlDoc = await collection.findOne({ alias });
    
    if (!urlDoc) {
      return new Response('URL not found', { status: 404 });
    }

    // Use Response.redirect() instead of next/navigation redirect
    return Response.redirect(urlDoc.url);
  } catch (error) {
    console.error('Error in redirect route:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 