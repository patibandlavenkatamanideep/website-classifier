import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";
import { ClassificationSchema, ClassifyResult, categories } from "./types";

const SYSTEM_PROMPT = `You are a website classifier. Classify the provided page content into exactly one of these categories:

- Ecommerce: Sites that primarily sell products or services (e.g., amazon.com, shopify.com, etsy.com).
- Social / UGC: Platforms where users create and share content or connect with others (e.g., twitter.com, reddit.com, tiktok.com).
- News / Media: Sites that primarily publish editorial content, journalism, or entertainment media (e.g., bbc.com, techcrunch.com, nytimes.com).
- Other: Sites that do not fit any of the above three categories — use this only when none genuinely applies.

Rules:
- Pick exactly one category. Prefer a specific category over "Other" whenever it reasonably fits.
- Provide a confidence score as a calibrated probability (0.0–1.0). For ambiguous pages, 0.6 is acceptable — do not default to 0.95.
- Provide 1–2 sentences of reasoning that cite specific signals from the page content (e.g., presence of shopping cart, user posts, bylines, navigation structure).`;

const CONTENT_LIMIT = 6000;
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = { result: ClassifyResult; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function getFromCache(url: string): ClassifyResult | null {
  const entry = cache.get(url);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(url);
    return null;
  }
  return entry.result;
}

function setInCache(url: string, result: ClassifyResult): void {
  cache.set(url, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function classify(url: string): Promise<ClassifyResult> {
  const cached = getFromCache(url);
  if (cached) return { ...cached, cached: true };

  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
  const doc = await firecrawl.scrape(url, { formats: ["markdown"] });

  if (!doc.markdown) {
    throw new Error("Failed to scrape page");
  }

  const content = doc.markdown.slice(0, CONTENT_LIMIT);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Classify this page:\n\n${content}` },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "classify_website",
          description: "Classify the website into a category with confidence and reasoning.",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: [...categories],
                description: "The website category.",
              },
              confidence: {
                type: "number",
                description: "Calibrated probability from 0.0 to 1.0.",
              },
              reasoning: {
                type: "string",
                description: "1–2 sentences citing specific signals from the page.",
              },
            },
            required: ["category", "confidence", "reasoning"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "classify_website" } },
  });

  const toolCall = response.choices[0]?.message.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("Unexpected LLM response");
  }

  const parsed = ClassificationSchema.parse(JSON.parse(toolCall.function.arguments));
  const result: ClassifyResult = { ...parsed, cached: false };
  setInCache(url, result);
  return result;
}
