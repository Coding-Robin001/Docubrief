import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"

export async function fetchAndExtractPdfText(fileUrl: string) {
  const response = await fetch(fileUrl);

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const loader = new PDFLoader(new Blob([arrayBuffer]));

  const docs = await loader.load();

//   then we combine all pages
  return docs.map((doc)=>doc.pageContent).join("\n")
}



export async function splitPdfText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10_000,
    chunkOverlap: 500,
  });

  const chunks = await splitter.splitText(text);

  return chunks;
}