"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResultCard } from "@/components/result-card";
import { ClassifyResult, ClassifyError } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; data: ClassifyResult; url: string }
  | { status: "error"; message: string };

export default function Home() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setState({ status: "loading" });

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const json = (await res.json()) as ClassifyResult | ClassifyError;

      if (!res.ok) {
        setState({ status: "error", message: (json as ClassifyError).error });
        return;
      }

      setState({ status: "result", data: json as ClassifyResult, url: trimmed });
    } catch {
      setState({ status: "error", message: "Network error — please try again." });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center px-4 py-24">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Website Classifier
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Paste a URL and get an instant category — Ecommerce, Social&nbsp;/&nbsp;UGC,
            News&nbsp;/&nbsp;Media, or Other.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="font-mono text-sm"
            disabled={state.status === "loading"}
            autoFocus
          />
          <Button
            onClick={submit}
            disabled={state.status === "loading" || url.trim() === ""}
            className="shrink-0"
          >
            {state.status === "loading" ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Classifying
              </span>
            ) : (
              "Classify"
            )}
          </Button>
        </div>

        {state.status === "loading" && <SkeletonCard />}

        {state.status === "result" && (
          <ResultCard result={state.data} url={state.url} />
        )}

        {state.status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 px-4 py-3">
            <p className="text-sm text-red-700 dark:text-red-400">{state.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none">
      <CardContent className="pt-6 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="h-3 w-48 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </CardContent>
    </Card>
  );
}
