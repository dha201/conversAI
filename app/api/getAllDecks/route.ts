// app/api/getAllChat/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await client.connect();
        const database = client.db('flashcardDB');
        const collection = database.collection('decks');

        // Find all conversations for the given userId
        const decks = await collection.find({ userId }).toArray();

        if (decks.length > 0) {
            console.log('All Conversations:', decks);
            return NextResponse.json(decks, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No conversations found for this user' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error retrieving conversations:', error);
        return NextResponse.json({ error: 'Error retrieving conversations' }, { status: 500 });
    } finally {
        await client.close();
    }
}
