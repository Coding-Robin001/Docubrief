const REQUIRED_HEADINGS = [
  "Document Details",
  "Key Highlights",
  "Why It Matters",
  "Main Points",
  "Pro Tips",
  "Key Terms to Know",
  "Bottom Line",
];

interface UnknownSection {
  heading?: unknown;
  bullets?: unknown[];
}

interface UnknownSummary {
  title?: unknown;
  overview?: unknown[];
  sections?: unknown;
}

/**
 * Normalizes a model's parsed JSON into the shape summarySchema expects:
 * exactly 7 sections, 2-6 non-empty bullets each, 1-2 overview lines.
 */
export function sanitizeSummaryData(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const summary = data as UnknownSummary;
  let rawSections: unknown[] = [];

  // some models return sections as an object instead of an array
  if (Array.isArray(summary.sections)) {
    rawSections = summary.sections;
  } else if (typeof summary.sections === "object" && summary.sections !== null) {
    rawSections = Object.values(summary.sections as Record<string, unknown>);
  }

  const sanitizedSections: UnknownSection[] = rawSections.map((item) => {
    if (typeof item === "object" && item !== null) {
      const section = item as UnknownSection;
      let bullets: string[] = [];

      if (Array.isArray(section.bullets)) {
        bullets = section.bullets
          .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
          .map((b) => b.trim());
      }

      if (bullets.length > 6) {
        bullets = bullets.slice(0, 6);
      }

      while (bullets.length < 2) {
        bullets.push("📌 No additional details provided.");
      }

      return {
        heading:
          typeof section.heading === "string" && section.heading.trim().length > 0
            ? section.heading.trim()
            : "Key Details",
        bullets,
      };
    }

    return {
      heading: "Key Details",
      bullets: ["📌 Information unavailable.", "📌 Refer to document text."],
    };
  });

  while (sanitizedSections.length < 7) {
    const missingIndex = sanitizedSections.length;
    sanitizedSections.push({
      heading: REQUIRED_HEADINGS[missingIndex] || `Section ${missingIndex + 1}`,
      bullets: ["📌 Information unavailable.", "📌 Refer to main document."],
    });
  }

  if (sanitizedSections.length > 7) {
    sanitizedSections.splice(7);
  }

  let overview: string[] = [];
  if (Array.isArray(summary.overview)) {
    overview = summary.overview
      .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
      .map((b) => b.trim());
  }

  if (overview.length === 0) {
    overview = ["📄 Overview summary unavailable."];
  } else if (overview.length > 2) {
    overview = overview.slice(0, 2);
  }

  return {
    ...summary,
    title:
      typeof summary.title === "string" && summary.title.trim().length > 0
        ? summary.title.trim()
        : "Document Summary",
    overview,
    sections: sanitizedSections,
  };
}