'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Loader2, Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    response: string;
    similarCases: Array<{ id: string; title: string; court: string; year: number; citation: string | null; pdfUrl: string | null }>;
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
              onChange={(e) => setQuery(e.target.value)}
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

          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 rounded-xl border border-border bg-card shadow-lg py-2 max-h-48 overflow-auto">
              {suggestions.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors"
                    onClick={() => setQuery(c.title)}
                  >
                    {c.title} — {c.court} ({c.year})
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
            <div className="card-premium p-6 md:p-8 relative">
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
              <div className="prose prose-sm dark:prose-invert max-w-none pr-24">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{result.response}</p>
              </div>
            </div>

            {result.similarCases.length > 0 ? (
              <div>
                <h3 className="font-semibold text-lg mb-3">Similar cases</h3>
                <ul className="space-y-3">
                  {result.similarCases.map((c) => (
                    <motion.li
                      key={c.id}
                      className="card-premium p-4"
                      whileHover={{ x: 4 }}
                    >
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{c.court} · {c.year}{c.citation ? ` · ${c.citation}` : ''}</p>
                      {c.pdfUrl && (
                        <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                          <FileText className="h-3.5 w-3.5" /> View PDF
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-muted-foreground font-medium">No similar cases found</p>
                <p className="text-sm text-muted-foreground mt-1">Add more judgments to the database to see relevant case references here.</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground flex items-center gap-2">
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
