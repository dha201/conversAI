import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function getChunkedDocsFromPDF(file: File) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error("Invalid file type. Expected a PDF.");
    }

    // Load PDF using the File directly, as it's a Blob
    const loader = new PDFLoader(file);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error("Error during PDF chunking:", e);
    throw new Error(`PDF docs chunking failed: ${e}`);
  }
}
