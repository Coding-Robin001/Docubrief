import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function fetchAndExtractPdfText(fileUrl: string) {
  // 1. download
  const downloadStart = Date.now();
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Couldn't download the PDF (status ${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  const downloadMs = Date.now() - downloadStart;

  // 2. parse
  const parseStart = Date.now();
  const loader = new PDFLoader(new Blob([buffer]));
  const docs = await loader.load();
  const parseMs = Date.now() - parseStart;

  // 3. combine all pages
  const text = docs.map((doc) => doc.pageContent).join("\n");

  console.log(
    `PDF: ${(buffer.byteLength / 1048576).toFixed(1)}MB, ${docs.length} pages | download ${downloadMs}ms, parse ${parseMs}ms`,
  );

  return text;
}

export async function splitPdfText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10_000,
    chunkOverlap: 500,
  });

  const chunks = await splitter.splitText(text);

  return chunks;
}
