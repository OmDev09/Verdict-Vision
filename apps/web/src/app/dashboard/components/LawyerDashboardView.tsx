'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, History, Wallet, Briefcase, FileText, ArrowUpRight, Scale, CheckCircle2, Bookmark, FileStack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { searchApi } from '@/lib/api';

export function LawyerDashboardView({ user }: { user: any }) {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        searchApi.history(4).then(setHistory).catch(() => { });
    }, []);

    return (
        <div className="flex flex-col w-full mx-auto pb-12">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
            >
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
                        <Briefcase className="h-3.5 w-3.5" /> Professional Account
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                        Workspace
                    </h1>
                    <p className="text-muted-foreground mt-3 text-base flex justify-start items-center gap-2">
                        Welcome back, <span className="font-semibold text-foreground">{user.name}</span>
                        {user.enrollmentNo && <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono">{user.enrollmentNo}</span>}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link href="/search">
                        <Button size="lg" className="rounded-xl shadow-lg shadow-indigo-500/20 px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Search className="h-4 w-4" /> New Case Analysis
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Analytics & Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Credits Remaining', value: user.credits, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Analyses Run (Mo)', value: '14', icon: FileStack, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Drafts Generated', value: '8', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Saved Citations', value: '42', icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="card-premium p-5 rounded-2xl flex flex-col justify-center border-border/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Work Area */}
                <div className="lg:col-span-2 space-y-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-card rounded-3xl p-8 border border-border/50 relative overflow-hidden group"
                    >
                        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4 text-indigo-500">
                                    <Scale className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground tracking-tight">AI Drafting Assistant</h2>
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Cut down your preliminary drafting time by 80%. Our legal model automatically translates facts and case law into drafted notice structures, courtroom arguments, and legal phrasing exactly matched to your Lexical search results.
                                </p>
                                <div className="space-y-3">
                                    {['Automated Courtroom Argument mapping', 'Pre-formatted legal Notice templates', 'Extraction of exact Citation Snippets'].map((feature) => (
                                        <div key={feature} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                                            <CheckCircle2 className="h-4 w-4 text-indigo-500" /> {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="shrink-0 w-full md:w-auto">
                                <Link href="/search">
                                    <Button variant="outline" className="w-full h-14 rounded-xl border-indigo-500/30 hover:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 gap-2 font-semibold">
                                        Open Drafting tool <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="card-premium rounded-3xl p-6 border border-border/50 h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold text-lg">Recent Casework</h3>
                            </div>
                            <Link href="/search?history=1" className="text-xs font-semibold text-primary hover:underline uppercase tracking-wider">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {history.length > 0 ? history.map((h, i) => (
                                <Link href={`/search?history=1&id=${h.id}`} key={h.id} className="block group border-b border-border/40 pb-4 last:border-0 last:pb-0">
                                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                        {h.query}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            {h.creditsUsed} credit
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(h.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="py-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
                                    <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No recent casework.<br />Run a search to populate.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>

        </div>
    );
}
