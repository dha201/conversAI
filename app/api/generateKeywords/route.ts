import { NextResponse } from 'next/server';
import { MongoClient, UpdateFilter } from 'mongodb';  // Importing UpdateFilter
import { OpenAI } from 'openai';
import { getVectorStore } from '@/app/lib/vector-store';
import { getPinecone } from '@/app/lib/pinecone-client';
import { Document } from "langchain/document";
import { getChunkedDocsFromPDF, getChunkedDocsFromText } from '@/app/lib/doc-loader';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

// Define the Flashcard interface
interface Flashcard {
    front: string;
    back: string;
}

// Define the DeckDocument interface that includes flashcards as an array of Flashcard
interface DeckDocument {
    userId: string;
    flashcardId: string;
    updatedAt: Date;
    flashcards: Flashcard[];
}

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const formData = await req.formData();
        console.log('Received formData from generateKeywords:', formData);

        const file = formData.get('pdf');
        const rawText = formData.get('text');
        const userId = formData.get('userId') as string;
        const deckName = formData.get('deckName') as string;

        if (!userId || !deckName) {
            return NextResponse.json({ error: 'Missing userId or deckName' }, { status: 400 });
        }

        let chunkedDocs: Document[] = [];
        let extractedContent = '';

        // Check for input data
        if (file && file instanceof Blob) {
            console.log('Processing file input...');
            chunkedDocs = await getChunkedDocsFromPDF(file);
        } else if (typeof rawText === 'string') {
            console.log('Processing text input...');
            chunkedDocs = await getChunkedDocsFromText(rawText);
        } else {
            console.error('No valid input provided');
            throw new Error('No valid input provided');
        }

        // Combine the chunked document content into a single string
        extractedContent = chunkedDocs.map(doc => doc.pageContent).join(' ');

        // Generate summary or keywords using OpenAI
        const keywords = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates keywords',
                },
                {
                    role: 'user',
                    content: `Extract keywords from this content: ${extractedContent}`,
                },
            ],
            temperature: 0.1,
        });

        const summaryOrKeywords = keywords.choices[0].message?.content?.trim() || '';
        console.log('Generated summary/keywords:', summaryOrKeywords);

        // Initialize Pinecone and Vector Store
        const pineconeClient = await getPinecone();
        const vectorStore = await getVectorStore(pineconeClient);

        const relevantDocs = await vectorStore.asRetriever().invoke(summaryOrKeywords);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n");

        // If context is empty or not available
        if (!context) {
            throw new Error('Failed to load context data');
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:
                  
                  Create clear and concise questions for the front of the flashcard.
                  Provide accurate and informative answers for the back of the flashcard.
                  Ensure that each flashcard focuses on a single concept or piece of information.
                  Use simple language to make the flashcards accessible to a wide range of learners.
                  Include a variety of question types, such as definitions, examples, comparisons, and applications.
                  Avoid overly complex or ambiguous phrasing in both questions and answers.
                  When appropriate, use mnemonics or memory aids to help reinforce the information.
                  Tailor the difficulty level of the flashcards to the user's specified preferences.
                  If given a body of text, extract the most important and relevant information for the flashcards.
                  Aim to create a balanced set of flashcards that covers the topic comprehensively.
                  
                  Return in the following JSON format and make sure to label the question with number:
                  {
                      "question [number]": [{
                          "front": str,
                          "back": str
                      }]
                  }`,
                },
                {
                    role: 'user',
                    content: `Here is the context: ${context}`,
                },
            ],
            temperature: 0.9,
        });

        const flashcardsJson = response.choices[0].message?.content?.trim();

        if (!flashcardsJson) {
            return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
        }

        // Parse the generated flashcards JSON
        let flashcards: Flashcard[];
        try {
            flashcards = JSON.parse(flashcardsJson);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to parse flashcards JSON' }, { status: 500 });
        }

        await client.connect();
        const database = client.db('flashcardDB');
        const collection = database.collection<DeckDocument>('decks');

        // Define the update filter with the correct typing
        const updateFilter: UpdateFilter<DeckDocument> = {
            $set: { updatedAt: new Date() },
            $push: { flashcards: { $each: flashcards } }  // Ensure flashcards is treated as an array
        };

        // Update the existing deck with the generated flashcards
        const result = await collection.updateOne(
            { userId, flashcardId: deckName },
            updateFilter,
            { upsert: true }  // This will insert the document if it doesn't exist
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            console.log('Deck updated with new flashcards');
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to update deck with flashcards' }, { status: 500 });
        }

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    } finally {
        await client.close();
    }
}
