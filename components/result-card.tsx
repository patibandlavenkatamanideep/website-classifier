import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassifyResult } from "@/lib/types";

const categoryColors: Record<ClassifyResult["category"], string> = {
  Ecommerce: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Social / UGC": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "News / Media": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

interface ResultCardProps {
  result: ClassifyResult;
  url: string;
}

export function ResultCard({ result, url }: ResultCardProps) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${categoryColors[result.category]} border-0 font-medium text-sm px-2.5 py-0.5`}>
            {result.category}
          </Badge>
          {result.cached && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">cached</span>
          )}
        </div>
        <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
          {Math.round(result.confidence * 100)}% confidence
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {result.reasoning}
        </p>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 truncate">{url}</p>
      </CardContent>
    </Card>
  );
}
