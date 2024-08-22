import { NextResponse } from 'next/server';
import { getVectorStore } from '@/app/lib/vector-store';
import { getPinecone } from '@/app/lib/pinecone-client';

export async function POST(req: Request) {
    try {
        const { keywords } = await req.json();

        if (!keywords) {
            return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
        }

        const pineconeClient = await getPinecone();
        const vectorStore = await getVectorStore(pineconeClient);
        const relevantDocs = await vectorStore.asRetriever().invoke(keywords);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n");

        if (!context) {
            throw new Error('Failed to load context data');
        }

        return NextResponse.json({ context, success: true }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
