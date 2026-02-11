"use client"

import { processWithOrchestrator } from "@/actions/orchestrator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ArrowRight, Bot, DollarSign, Loader2, Zap } from "lucide-react"
import { useState, useTransition } from "react"

export default function OrchestratorPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [history, setHistory] = useState<any[]>([])

  const handleSubmit = async () => {
    if (!query.trim()) return

    startTransition(async () => {
      try {
        // Determine organization ID (in a real app, this comes from context/auth)
        // For now, we let the server action resolve it
        const response = await processWithOrchestrator({
          userQuery: query,
        })

        setResult(response)
        setHistory(prev => [response, ...prev])
      } catch (error) {
        console.error("Orchestration failed:", error)
      }
    })
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "business_plan": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "grant_application": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "product_sourcing": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "seo_optimization": return "bg-green-500/10 text-green-500 border-green-500/20"
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          AI Orchestrator
        </h1>
        <p className="text-muted-foreground">
          One interface to rule them all. Describe your task, and the Orchestrator will route it to the right specialist agent.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>New Task</CardTitle>
              <CardDescription>Describe what you need help with.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., 'Write a business plan for TIPS about a smart farm solution' or 'Find wholesale suppliers for yoga mats on 1688'"
                className="min-h-[150px] text-lg resize-none p-4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Powered by Gemini 1.5 Flash
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !query.trim()}
                className="w-32 transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    Run Workflow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Prompts */}
          <div className="grid grid-cols-1 gap-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">Try these examples:</p>
            {[
              "Write a business plan for TIPS about AI-driven logistics",
              "Find me a supplier for organic cotton t-shirts on 1688",
              "Optimize SEO for my Naver Smart Store selling vitamins",
              "Match my startup to government R&D grants",
              "Convert this HWP file to PDF for me"
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className="text-left text-sm p-3 rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {result ? (
            <Card className={cn(
              "border-2 transition-all animate-in fade-in slide-in-from-bottom-4",
              result.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Workflow Result</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Correlation ID:</span>
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">{result.correlationId.slice(0, 8)}...</code>
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Completed" : "Failed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Intent</div>
                    <Badge variant="outline" className={getIntentColor(result.state.intent)}>
                      {result.state.intent}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Agent</div>
                    <div className="font-medium flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      {result.agent}
                    </div>
                  </div>
                </div>

                {/* Cost Section */}
                <div className="p-3 rounded-lg bg-background border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Cost Analysis</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">${result.actualCost.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">Est: ${result.estimatedCost.toFixed(6)}</div>
                  </div>
                </div>

                {/* Output Section */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Final Output</div>
                  <div className="p-4 rounded-lg bg-background border min-h-[100px] text-sm whitespace-pre-wrap">
                    {typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}
                  </div>
                </div>

                {/* Routing Reasoning */}
                {result.state.routingReason && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded italic">
                    "Reasoning: {result.state.routingReason}"
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
              <Bot className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="font-medium text-lg mb-2">Ready to Orchestrate</h3>
              <p className="max-w-xs text-sm">
                Enter a prompt to see the multi-agent graph in action. Steps will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="space-y-4 pt-8 border-t">
          <h2 className="text-xl font-semibold">Recent Workflows</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {history.slice(1, 4).map((item, i) => ( // Skip first as it is shown above
              <Card key={i} className="bg-muted/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{item.state.intent}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.state.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-medium line-clamp-1">
                    {item.state.userQuery}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    Agent: {item.agent}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
