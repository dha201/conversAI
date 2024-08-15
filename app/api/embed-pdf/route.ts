import { NextResponse } from 'next/server';
import { getPinecone } from '../../lib/pinecone-client';
import { getChunkedDocsFromPDF, getChunkedDocsFromText } from '../../lib/doc-loader';
import { embedAndStoreDocs } from '../../lib/vector-store';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    const pineconeClient = await getPinecone();

    let chunks;

    // Handle PDF Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const fileEntry = formData.get('pdf');

      if (!fileEntry || !(fileEntry instanceof File)) {
        return NextResponse.json({ error: 'No file uploaded or invalid file type' }, { status: 400 });
      }

      const file = fileEntry as File;
      chunks = await getChunkedDocsFromPDF(file);

    } 

    // Handle JSON/Text input
    else if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      const body = await request.json();
      
      // Check if we received plain text or JSON structure
      const inputText = typeof body === 'string' ? body : JSON.stringify(body);

      chunks = await getChunkedDocsFromText(inputText);
      
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    // Embed and store the chunks
    await embedAndStoreDocs(pineconeClient, chunks);

    return NextResponse.json({ message: 'Content embedded successfully' });

  } catch (error) {
    console.error('Error embedding content:', error);
    return NextResponse.json({ error: 'Failed to embed content' }, { status: 500 });
  }
}
