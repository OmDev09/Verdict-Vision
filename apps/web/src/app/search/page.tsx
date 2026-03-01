'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Loader2, Copy, Check, FileText, Bot, Scale, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';
import { searchApi, casesApi } from '@/lib/api';

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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="glass-card p-6 md:p-8 rounded-2xl animate-pulse">
        <div className="h-4 bg-muted rounded w-full mb-3" />
        <div className="h-4 bg-muted rounded w-11/12 mb-3" />
        <div className="h-4 bg-muted rounded w-full mb-3" />
        <div className="h-4 bg-muted rounded w-4/5 mb-3" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
      <div>
        <div className="h-5 bg-muted rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { user, loading: authLoading, refetch } = useAuth();
  const [query, setQuery] = useState('');
  const [court, setCourt] = useState('');
  const [year, setYear] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; court: string; year: number }>>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    response: string;
    similarCases: Array<{ id: string; title: string; court: string; year: number; citation: string | null; pdfUrl: string | null; snippet?: string | null }>;
    creditsRemaining: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ id: string; query: string; creditsUsed: number; createdAt: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

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

  useEffect(() => {
    if (!user) return;
    searchApi.history(10).then(setHistory).catch(() => setHistory([]));
  }, [user, result]);

  const copyResponse = useCallback(() => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result?.response]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsAutocompleteOpen(false);
    if (!query.trim() || !user) return;
    setError('');
    setResult(null);
    setSearching(true);
    try {
      const data = await searchApi.search({
        query: query.trim(),
        ...(court && { court }),
        ...(year && { year: parseInt(year, 10) }),
      });
      setResult({
        response: data.response,
        similarCases: data.similarCases,
        creditsRemaining: data.creditsRemaining,
      });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.form
          onSubmit={handleSearch}
          className="relative mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Describe your legal situation or search for a topic..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsAutocompleteOpen(true);
              }}
              onFocus={() => setIsAutocompleteOpen(true)}
              onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 200)}
              className="pl-10 pr-28 py-6 text-base rounded-xl"
              disabled={searching}
            />
            <Button type="submit" disabled={searching || !query.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-end mb-2">
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="court" className="text-xs text-muted-foreground">Court</Label>
              <select
                id="court"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                disabled={searching}
                className="mt-1 w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {COURTS.map((c) => (
                  <option key={c.value || 'any'} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="w-[120px]">
              <Label htmlFor="year" className="text-xs text-muted-foreground">Year</Label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={searching}
                className="mt-1 w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {YEARS.map((y) => (
                  <option key={y.value || 'any'} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isAutocompleteOpen && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-2 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-2xl py-2 max-h-60 overflow-auto dark:shadow-primary/5">
              {suggestions.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-5 py-3 hover:bg-primary/10 hover:text-primary text-sm transition-colors border-b border-border/30 last:border-0"
                    onClick={() => {
                      setQuery(c.title);
                      setIsAutocompleteOpen(false);
                    }}
                  >
                    <div className="font-medium line-clamp-1">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {c.court} · {c.year}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.form>

        <div className="flex gap-2 mb-6">
          <Button variant={!showHistory ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowHistory(false)} className="rounded-lg">
            Result
          </Button>
          <Button variant={showHistory ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowHistory(true)} className="rounded-lg">
            History
          </Button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive bg-destructive/10 rounded-xl px-4 py-3 mb-4"
          >
            {error}
          </motion.p>
        )}

        {showHistory ? (
          <motion.ul
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {history.map((h) => (
              <li key={h.id} className="flex justify-between items-center py-3 px-4 card-premium text-sm">
                <span className="text-foreground font-medium">{h.query}</span>
                <span className="text-muted-foreground shrink-0 ml-2">{h.creditsUsed} credit · {new Date(h.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
            {history.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">No search history yet. Run a search to get started.</p>
            )}
          </motion.ul>
        ) : searching ? (
          <SearchSkeleton />
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="card-premium p-6 md:p-8 relative border-t-4 border-t-primary/80">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg tracking-tight">AI Generated Analysis</h3>
              </div>
              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyResponse}
                  className="gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none pr-12 prose-headings:text-primary/90 prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.response}
                </ReactMarkdown>
              </div>
            </div>

            {result.similarCases.length > 0 ? (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 dark:text-blue-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg tracking-tight">Postgres Retrieved Official Court Records</h3>
                </div>
                <ul className="space-y-4">
                  {result.similarCases.map((c) => (
                    <motion.li
                      key={c.id}
                      className="card-premium p-5 border-l-4 border-l-blue-500/60"
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-base leading-snug">{c.title}</p>
                          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            {c.court} · {c.year}{c.citation ? ` · ${c.citation}` : ''}
                          </p>
                        </div>
                        {c.pdfUrl && user?.role === 'LAWYER' && (
                          <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                            <Button variant="secondary" size="sm" className="gap-2 h-9">
                              <FileText className="h-4 w-4" /> View Original Judgment
                            </Button>
                          </a>
                        )}
                      </div>

                      {c.snippet && (
                        <div className="mt-4">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="summary" className="border-b-0">
                              <AccordionTrigger className="text-sm text-blue-500 hover:text-blue-600 py-2 hover:no-underline rounded-lg px-3 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                                View Brief Summary
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-foreground/80 leading-relaxed pt-3 px-3">
                                {c.snippet}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}

                      {!c.snippet && c.pdfUrl && user?.role !== 'LAWYER' && (
                        <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline mt-3">
                          <FileText className="h-4 w-4" /> View Original Document
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <Scale className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-muted-foreground font-medium">No official court cases matched exactly</p>
                <p className="text-sm text-muted-foreground mt-1">Our Postgres BM25 search couldn't find an exact lexical match in our current database sample.</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-6">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary/60" />
              Credits remaining: <strong className="text-foreground">{result.creditsRemaining}</strong>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center"
          >
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">Run a search to see AI analysis</p>
            <p className="text-sm text-muted-foreground mt-1">Describe your legal situation above and tap Search. You’ll get an explanation and similar cases (when available).</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
