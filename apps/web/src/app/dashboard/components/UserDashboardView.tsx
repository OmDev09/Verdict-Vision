'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Copy, Check, FileText, Bot, Scale, BookOpen, Menu, X, Plus, LogOut, Wallet, Moon, Sun, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { searchApi, casesApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { SiteLogo } from '@/components/site-logo';
import { cn } from '@/lib/utils';
import { CitizenSidebar } from './CitizenSidebar';

const COURTS = [
    { value: '', label: 'Any court' },
    { value: 'Supreme Court of India', label: 'Supreme Court of India' },
    { value: 'Delhi High Court', label: 'Delhi High Court' },
];

const YEARS = [
    { value: '', label: 'Any year' },
    ...Array.from({ length: 15 }, (_, i) => {
        const y = new Date().getFullYear() - i;
        return { value: String(y), label: String(y) };
    }),
];

function SearchSkeleton() {
    return (
        <div className="flex justify-start items-start gap-3 w-full animate-pulse mt-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Scale className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-4 pt-1">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-11/12" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-20 bg-muted rounded-2xl w-full mt-6" />
            </div>
        </div>
    );
}

export function UserDashboardView({ user }: { user: any }) {
    const router = useRouter();
    const { refetch } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    // Search State
    const [query, setQuery] = useState('');
    const [court, setCourt] = useState('');
    const [year, setYear] = useState('');
    const [suggestions, setSuggestions] = useState<Array<any>>([]);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<{
        queryTitle: string;
        response: string;
        similarCases: Array<any>;
        creditsRemaining: number;
        searchId?: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchHistory();
    }, [result]);

    const fetchHistory = useCallback(() => {
        searchApi.history(30).then(setHistory).catch(() => { });
    }, []);

    // BM25 Autocomplete suggestions effect
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const t = setTimeout(() => {
            casesApi.suggest(query.trim(), court || undefined, year || undefined).then(setSuggestions).catch(() => setSuggestions([]));
        }, 300);
        return () => clearTimeout(t);
    }, [query, court, year]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [result, searching, error]);

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        setIsAutocompleteOpen(true);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    };

    const copyResponse = useCallback(() => {
        if (!result?.response) return;
        navigator.clipboard.writeText(result.response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [result?.response]);

    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setIsAutocompleteOpen(false);
        if (!query.trim() || !user) return;
        const currentQuery = query.trim();
        setError('');
        setResult(null);
        setSearching(true);
        setQuery('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const data = await searchApi.search({
                query: currentQuery,
                ...(court && { court }),
                ...(year && { year: parseInt(year, 10) }),
            });
            setResult({
                queryTitle: currentQuery,
                response: data.response,
                similarCases: data.similarCases,
                creditsRemaining: data.creditsRemaining,
                searchId: data.searchId,
            });
            await refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setQuery(currentQuery);
        } finally {
            setSearching(false);
        }
    }

    async function loadHistory(id: string) {
        setIsSidebarOpen(false);
        setIsAutocompleteOpen(false);
        setError('');
        setResult(null);
        setSearching(true);
        setQuery('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const data = await searchApi.getHistoryById(id);
            setResult({
                queryTitle: data.query,
                response: data.response,
                similarCases: data.similarCases,
                creditsRemaining: data.creditsRemaining,
                searchId: data.searchId,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setSearching(false);
        }
    }

    function startNewChat() {
        setResult(null);
        setError('');
        setQuery('');
        setCourt('');
        setYear('');
        setIsSidebarOpen(false);
        setIsAutocompleteOpen(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    return (
        <div className="flex h-full w-full bg-background overflow-hidden relative">

            <CitizenSidebar
                history={history}
                loadHistory={loadHistory}
                currentSearchId={result?.searchId}
                startNewChat={startNewChat}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative bg-background">

                {/* Header - Mobile & Desktop Toggle + Title */}
                <div className="flex items-center justify-between p-3 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden text-muted-foreground">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                            const sidebar = document.querySelector('.md\\:static') as HTMLElement;
                            if (sidebar) sidebar.classList.toggle('md:hidden');
                        }} className="hidden md:flex text-muted-foreground hover:bg-muted" aria-label="Toggle Sidebar">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div onClick={startNewChat} className="cursor-pointer">
                            <SiteLogo href="#" />
                        </div>
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase hidden sm:block">Citizen</span>
                    </div>
                </div>

                {/* Scrollable Transcript Area */}
                <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-36" ref={scrollRef}>
                    {!result && !searching && !error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center p-6 text-center"
                        >
                            <div className="p-4 bg-primary/10 rounded-full mb-6">
                                <Scale className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                                What do you need to know?
                            </h1>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                Ask about rent disputes, family law, property rights, or general legal procedures in India.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">

                            {/* User Message Bubble */}
                            {(result?.queryTitle || error) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end"
                                >
                                    <div className="bg-muted px-5 py-3.5 rounded-3xl rounded-tr-sm max-w-[85%] text-foreground font-medium text-[15px] shadow-sm leading-relaxed">
                                        {result?.queryTitle || query}
                                    </div>
                                </motion.div>
                            )}

                            {/* AI Message Bubble */}
                            {searching ? (
                                <SearchSkeleton />
                            ) : error ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                        <Scale className="h-4 w-4 text-destructive" />
                                    </div>
                                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium">
                                        {error}
                                    </div>
                                </div>
                            ) : result ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3 md:gap-4"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-primary/20">
                                        <Scale className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">

                                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.response}</ReactMarkdown>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={copyResponse} className="gap-1.5 h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                                                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>

                                        {/* Official Court Case Records */}
                                        {result.similarCases.length > 0 && (
                                            <div className="mt-8">
                                                <div className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-4 flex items-center gap-2">
                                                    <BookOpen className="h-3 w-3" /> Reference Cases
                                                </div>
                                                <div className="grid gap-3">
                                                    {result.similarCases.map((c) => (
                                                        <div key={c.id} className="border border-border/60 bg-card rounded-2xl p-4 transition-all hover:border-primary/30">
                                                            <p className="font-semibold text-[14px] leading-snug">{c.title}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                                                                <span className="bg-muted px-2 py-0.5 rounded-md">{c.court}</span>
                                                                <span>·</span>
                                                                <span>{c.year}</span>
                                                                {c.citation && <><span>·</span><span className="truncate max-w-[120px]">{c.citation}</span></>}
                                                            </div>
                                                            {!c.snippet && c.pdfUrl && (
                                                                <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-3 transition-colors">
                                                                    <FileText className="h-3 w-3" /> View Original Judgment
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : null}

                        </div>
                    )}
                </div>

                {/* Floating Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-4 md:pb-6 px-4">
                    <div className="max-w-3xl mx-auto w-full relative">

                        {/* Suggestion Popover */}
                        <AnimatePresence>
                            {isAutocompleteOpen && suggestions.length > 0 && (
                                <motion.ul
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute bottom-full mb-3 w-full bg-card border shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden py-2"
                                >
                                    {suggestions.slice(0, 4).map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors border-b border-border/30 last:border-0"
                                                onClick={() => {
                                                    setQuery(c.title);
                                                    setIsAutocompleteOpen(false);
                                                    textareaRef.current?.focus();
                                                }}
                                            >
                                                <div className="font-medium line-clamp-1">{c.title}</div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    {c.court} · {c.year}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>

                        <form
                            onSubmit={handleSearch}
                            className="w-full bg-card shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] rounded-3xl border border-border/80 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all transition-[border,box-shadow]"
                        >
                            <div className="px-3 pt-3 pb-2 flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    value={query}
                                    onChange={handleTextareaChange}
                                    onFocus={() => setIsAutocompleteOpen(true)}
                                    onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 200)}
                                    placeholder="Message Verdict Vision..."
                                    className="w-full resize-none bg-transparent border-0 focus-visible:ring-0 px-1 py-1 text-[15px] placeholder:text-muted-foreground/70 min-h-[44px] max-h-32 disabled:opacity-50"
                                    rows={1}
                                    disabled={searching}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between mt-2 pl-1 pr-1">

                                    {/* Filters inside input bar */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <select
                                            value={court}
                                            onChange={e => setCourt(e.target.value)}
                                            disabled={searching}
                                            className="bg-muted hover:bg-muted/80 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border-none focus:ring-0 cursor-pointer text-muted-foreground w-auto max-w-[130px] truncate transition-colors"
                                        >
                                            {COURTS.map(c => <option key={c.value || 'any'} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <select
                                            value={year}
                                            onChange={e => setYear(e.target.value)}
                                            disabled={searching}
                                            className="bg-muted hover:bg-muted/80 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border-none focus:ring-0 cursor-pointer text-muted-foreground w-auto transition-colors"
                                        >
                                            {YEARS.map(c => <option key={c.value || 'any'} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={searching || !query.trim()}
                                        size="icon"
                                        className="h-8 w-8 rounded-full shadow-sm bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
                                    >
                                        {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </form>
                        <p className="text-center text-[10px] md:text-[11px] text-muted-foreground mt-3 font-medium px-4">
                            AI can make strict legal interpretation mistakes. Always consult a valid lawyer.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
