import { NextResponse } from 'next/server';
import { getPinecone } from '../../lib/pinecone-client';
import { getChunkedDocsFromPDF } from '../../lib/pdf-loader';
import { embedAndStoreDocs } from '../../lib/vector-store';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('pdf') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const pineconeClient = await getPinecone();
    const chunks = await getChunkedDocsFromPDF(file);
    await embedAndStoreDocs(pineconeClient, chunks);

    return NextResponse.json({ message: 'PDF embedded successfully' });
  } catch (error) {
    console.error('Error embedding PDF:', error);
    return NextResponse.json({ error: 'Failed to embed PDF' }, { status: 500 });
  }
}
