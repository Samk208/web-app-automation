"use client";

import { processWithOrchestrator } from "@/actions/orchestrator";
import { ThinkingProcess } from "@/components/features/ThinkingProcess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowRight, Bot, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function WelcomeChat() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<any | null>(null);

  const handleSubmit = () => {
    if (!query.trim()) return;
    startTransition(async () => {
      try {
        const response = await processWithOrchestrator({ userQuery: query });
        setLastResult(response);
      } catch (err) {
        console.error("WelcomeChat orchestrator call failed", err);
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-5 w-5 text-primary" />
            Welcome Agent
          </CardTitle>
          <CardDescription>
            Ask in natural language and I will route you to the right specialist agent.
          </CardDescription>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary text-xs">
          Orchestrator v1
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Textarea
            placeholder="e.g. 'Find grants for an AI logistics startup' or 'Convert my business plan to HWP'"
            className="min-h-[120px] resize-none bg-slate-950/60 border-slate-700/60 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {["Write a TIPS business plan", "Match my startup to 2026 grants", "Find programs for foreign founders"].map(
              (prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="px-2 py-1 rounded-full border border-slate-700/70 hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {prompt}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="relative min-h-[140px] flex flex-col gap-3">
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <ThinkingProcess />
              <p className="text-xs text-muted-foreground">Routing your request to the best agent…</p>
            </div>
          ) : lastResult ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    lastResult.state.intent === "business_plan" && "border-blue-500/60 text-blue-400",
                    lastResult.state.intent === "grant_application" && "border-purple-500/60 text-purple-400",
                    lastResult.state.intent === "startup_programs" && "border-emerald-500/60 text-emerald-400",
                  )}
                >
                  Intent: {lastResult.state.intent}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  Agent: {lastResult.agent}
                </span>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {typeof lastResult.output === "string"
                  ? lastResult.output
                  : JSON.stringify(lastResult.output, null, 2)}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {lastResult.state.results[lastResult.agent]?.planId && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => router.push(`/dashboard/business-plan-master?id=${lastResult.state.results[lastResult.agent].planId}`)}
                  >
                    Open Business Plan Master <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {lastResult.state.results[lastResult.agent]?.applicationId && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => router.push(`/dashboard/grant-scout?id=${lastResult.state.results[lastResult.agent].applicationId}`)}
                  >
                    Open Grant Scout <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {lastResult.state.results[lastResult.agent]?.taskId && lastResult.agent === 'china_source' && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => router.push(`/dashboard/china-source?id=${lastResult.state.results[lastResult.agent].taskId}`)}
                  >
                    Open ChinaSource <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {lastResult.state.results[lastResult.agent]?.auditId && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => router.push(`/dashboard/naver-seo?id=${lastResult.state.results[lastResult.agent].auditId}`)}
                  >
                    Open Naver SEO Master <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-center h-full gap-2 text-xs text-muted-foreground">
              <p className="font-medium text-slate-200">Try asking:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"Which 2026 K-Startup programs fit an AI SaaS startup?"</li>
                <li>"Generate a business plan for TIPS in Korean."</li>
                <li>"Summarize my options as a foreign founder in 2026."</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-slate-800/80 bg-slate-950/70 px-6 py-3">
        <span className="text-[11px] text-muted-foreground">
          Natural language router powered by LangGraph Orchestrator.
        </span>
        <Button
          size="sm"
          className="h-8 px-4 text-xs"
          disabled={isPending || !query.trim()}
          onClick={handleSubmit}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Thinking…
            </>
          ) : (
            <>
              Ask Agent
              <ArrowRight className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
