import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
                <div className="container py-24 px-4 sm:px-8 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
                        <p className="text-xl text-muted-foreground">
                            Choose the plan that fits your agent workforce needs. All plans include our core orchestration engine.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
                        {/* Starter */}
                        <div className="rounded-2xl border bg-card p-8 flex flex-col shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">Starter</h3>
                                <p className="text-muted-foreground text-sm">For individuals and experiments.</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button className="w-full mb-8" variant="outline">Get Started</Button>
                            <ul className="space-y-3 text-sm flex-1">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 3 Agent Systems</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 1,000 Runs / month</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 7-day Log Retention</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Community Support</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="rounded-2xl border border-primary bg-primary/5 p-8 flex flex-col shadow-lg relative">
                            <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                POPULAR
                            </div>
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-primary">Pro</h3>
                                <p className="text-muted-foreground text-sm">For scaling teams.</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button className="w-full mb-8">Start Free Trial</Button>
                            <ul className="space-y-3 text-sm flex-1">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Agent Systems</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 50,000 Runs / month</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 90-day Log Retention</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Human-in-the-Loop Queues</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority Email Support</li>
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="rounded-2xl border bg-card p-8 flex flex-col shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">Enterprise</h3>
                                <p className="text-muted-foreground text-sm">For high-volume compliance.</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">Custom</span>
                            </div>
                            <Button className="w-full mb-8" variant="secondary">Contact Sales</Button>
                            <ul className="space-y-3 text-sm flex-1">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Private Cloud Deployment</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Runs</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Custom Log Retention</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SSO & SAML</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Dedicated Success Manager</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
