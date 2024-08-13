import { NextResponse } from 'next/server';
import { getPinecone } from '../../lib/pinecone-client';
import { getChunkedDocsFromPDF } from '../../lib/pdf-loader';
import { embedAndStoreDocs } from '../../lib/vector-store';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const fileEntry = formData.get('pdf');
    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded or invalid file type' }, { status: 400 });
    }

    const file = fileEntry as File;

    const pineconeClient = await getPinecone();
    const chunks = await getChunkedDocsFromPDF(file);
    await embedAndStoreDocs(pineconeClient, chunks);

    return NextResponse.json({ message: 'PDF embedded successfully' });
  } catch (error) {
    console.error('Error embedding PDF:', error);
    return NextResponse.json({ error: 'Failed to embed PDF' }, { status: 500 });
  }
}
