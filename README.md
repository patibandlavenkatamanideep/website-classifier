# Website Classifier

A small Next.js app that takes any URL, scrapes the page using Firecrawl, and asks GPT-4o mini to classify it into one of four categories: **Ecommerce**, **Social / UGC**, **News / Media**, or **Other**. Results include a confidence score, a brief reasoning statement, and are cached in-memory for one hour so repeated lookups are instant.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

```
OPENAI_API_KEY=your_openai_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Implementation notes

**Why gpt-4o-mini?** Fast, cheap, and the task is simple classification — four categories, clear signals, short output. A larger model adds cost with no meaningful quality gain here.

**Why an in-memory `Map` cache instead of Redis?** This is a single-instance demo app and the brief explicitly rules out a database. A `Map` with a TTL check is ~15 lines and zero infrastructure. For a multi-instance production deployment, swap in Vercel KV or another distributed cache.

**Why Firecrawl over raw `fetch`?** Firecrawl handles JavaScript-rendered pages and returns clean markdown, which gives the LLM a much better signal than raw HTML. A naive `fetch` would fail on most modern SPAs.

**Known limitations:** Pages that require authentication or aggressively block bots will fail to scrape. The four-category taxonomy is intentionally coarse. LLM confidence scores are not truly calibrated probabilities — treat them as relative signals, not absolutes.

## Deployed URL

[https://website-classifier-g1barauo7.vercel.app](https://website-classifier-g1barauo7.vercel.app)
