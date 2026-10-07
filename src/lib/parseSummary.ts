import { summarySchema, type GeneratedSummary } from "./summarySchema";

export type SummarySlide = {
  tag: string;
  heading: string;
  bullets: string[];
};

export type ParsedSummary = {
  title: string;
  slides: SummarySlide[];
};

/**
 * Parses a stored summaryText value into a title + slides. Tries the
 * new structured JSON format first (see summary-schema.ts); if that
 * fails — e.g. this is an older row saved before the JSON migration —
 * falls back to the old markdown parser so existing data doesn't break.
 */
export function parseSummary(raw: string): ParsedSummary {
  const structured = tryParseStructured(raw);
  if (structured) return structured;

  return parseLegacyMarkdown(raw);
}

function tryParseStructured(raw: string): ParsedSummary | null {
  let json: unknown;

  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = summarySchema.safeParse(json);
  if (!result.success) return null;

  return buildSlides(result.data);
}

function buildSlides(data: GeneratedSummary): ParsedSummary {
  const overviewSlide: SummarySlide = {
    tag: "Quick Overview",
    heading: "What this document is about",
    bullets: data.overview,
  };

  const sectionSlides: SummarySlide[] = data.sections.map((s) => ({
    tag: s.heading,
    heading: s.heading,
    bullets: s.bullets,
  }));

  return {
    title: data.title,
    slides: [overviewSlide, ...sectionSlides],
  };
}

// --- legacy fallback, for rows saved before the structured-JSON migration ---

const HEADING_REGEX = /^#{2,4}\s+(.+?)\s*$/;
const BULLET_REGEX = /^[*\-•]\s+(.+?)\s*$/;

function stripMarkdownEmphasis(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .trim();
}

function parseLegacyMarkdown(raw: string): ParsedSummary {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => Boolean(l) && l !== "---");

  let title = "Document Summary";
  let startIndex = 0;

  if (
    lines.length > 0 &&
    !BULLET_REGEX.test(lines[0]) &&
    !HEADING_REGEX.test(lines[0])
  ) {
    title = stripMarkdownEmphasis(lines[0]);
    startIndex = 1;
  }

  const slides: SummarySlide[] = [];
  let currentHeading: string | null = null;
  let currentBullets: string[] = [];
  const overviewBullets: string[] = [];
  let sawHeading = false;

  const pushCurrent = () => {
    if (currentHeading) {
      slides.push({
        tag: currentHeading,
        heading: currentHeading,
        bullets: currentBullets,
      });
    }
    currentBullets = [];
  };

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(HEADING_REGEX);

    if (headingMatch) {
      sawHeading = true;
      pushCurrent();
      currentHeading = stripMarkdownEmphasis(headingMatch[1]);
      continue;
    }

    const bulletMatch = line.match(BULLET_REGEX);
    const content = stripMarkdownEmphasis(bulletMatch ? bulletMatch[1] : line);

    if (!sawHeading) {
      overviewBullets.push(content);
    } else {
      currentBullets.push(content);
    }
  }
  pushCurrent();

  const overviewSlide: SummarySlide = {
    tag: "Quick Overview",
    heading: "What this document is about",
    bullets:
      overviewBullets.length > 0 ? overviewBullets : ["No overview available."],
  };

  return {
    title,
    slides: [overviewSlide, ...slides],
  };
}

export function countWords(raw: string): number {
  const structured = tryParseStructured(raw);

  if (structured) {
    const allText = structured.slides
      .flatMap((s) => [s.heading, ...s.bullets])
      .concat(structured.title)
      .join(" ");
    return allText.split(/\s+/).filter(Boolean).length;
  }

  return raw
    .replace(/[#*_`]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}