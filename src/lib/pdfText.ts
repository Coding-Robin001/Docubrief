
// Below this, the PDF is probably scanned or image-only. Don't summarise it
// or cache it, since every later question would run against nothing.
export const MIN_USABLE_PDF_CHARS = 50;

// Upper bound on what we store per summary (about 1.5MB of text). Generous
// enough for a ~900k-character document, but stops a huge file bloating the DB.
export const MAX_STORED_PDF_CHARS = 1_500_000;

export function prepareForStorage(text: string): string {
  return text.slice(0, MAX_STORED_PDF_CHARS);
}