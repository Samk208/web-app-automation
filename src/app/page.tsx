import { ThinkingProcess } from "@/components/features/ThinkingProcess";
import { DeepTechShowcase } from "@/components/marketing/deep-tech-showcase";
import { ScrollytellingFeatures } from "@/components/marketing/scrollytelling-features";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Full Height Hero Section */}
        <section className="relative overflow-hidden min-h-[95vh] flex items-center pt-20 pb-32 bg-background">
          <div className="container mx-auto px-4 sm:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Column: Text & CTA */}
              <div className="space-y-8 flex flex-col items-start text-left">

                {/* Badge */}
                <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                  <span className="tracking-wide font-mono">System v2.0: Deep Tech Enabled</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1] text-foreground max-w-3xl">
                  Agents that <br />
                  <span className="text-gradient-gold relative">
                    Plan, Reason, & Verify.
                    <span className="absolute inset-0 blur-3xl opacity-20 bg-amber-500/50 -z-10"></span>
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-muted-foreground md:text-2xl leading-relaxed tracking-wide font-light max-w-xl">
                  Stop deploying brittle scripts. Build autonomous trade & service workflows that <span className="text-foreground font-medium">fix themselves</span> when things go wrong.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 w-full sm:w-auto">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all bg-indigo-600 hover:bg-indigo-500 text-white border-0 w-full">
                      Launch Console <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/docs" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 w-full glass-panel hover:text-white transition-colors">
                      View Blueprints
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Visualizer */}
              <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none flex items-center justify-center">
                {/* Abstract BG Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full -z-10 animate-pulse" />

                {/* Floating Cards Mockup */}
                <div className="relative w-full">
                  {/* The Thinking Process Component - Center Stage */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[120%] sm:w-full">
                    <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                        </div>
                        <span className="text-xs font-mono text-slate-500 ml-2">agent_core.tsx</span>
                      </div>
                      <ThinkingProcess />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] opacity-20 pointer-events-none" />
        </section>

        {/* Social Proof with Infinite Marquee */}
        <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-8">Trusted by engineering teams at</p>

            <div className="relative flex overflow-hidden">
              {/* Gradients to mask edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

              <div className="flex gap-16 animate-[infinite-scroll_30s_linear_infinite] shrink-0 items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {/* Repeated list for seamless loop */}
                {["Acme Corp", "TechFlow", "Nebula AI", "GlobalLink", "DataSphere", "Synthetix", "Orbital", "HyperScale", "Quantum", "Vertex"].map((logo) => (
                  <span key={logo} className="text-xl font-bold text-slate-300 whitespace-nowrap">{logo}</span>
                ))}
                {["Acme Corp", "TechFlow", "Nebula AI", "GlobalLink", "DataSphere", "Synthetix", "Orbital", "HyperScale", "Quantum", "Vertex"].map((logo) => (
                  <span key={`dup-${logo}`} className="text-xl font-bold text-slate-300 whitespace-nowrap">{logo}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scrollytelling Section: The Architecture */}
        <ScrollytellingFeatures />

        {/* Deep Tech Showcase */}
        <DeepTechShowcase />

        {/* Final CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="rounded-3xl bg-slate-900 text-white p-12 md:p-24 text-center overflow-hidden relative">
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Ready to deploy your workforce?</h2>
                <p className="text-slate-300 text-xl">
                  Join hundreds of engineering teams building simpler, safer agent systems.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto">
                      Start Building for Free
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto bg-transparent border-slate-600 text-white hover:bg-slate-800">
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
