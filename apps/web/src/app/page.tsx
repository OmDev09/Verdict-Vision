'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import {
  Search,
  FileText,
  Shield,
  ScaleIcon,
  Moon,
  Sun,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/public-header';
import { useTheme } from '@/contexts/theme-context';
import { SiteLogo } from '@/components/site-logo';

// Animation configs
const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 * i },
  }),
};

const item = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  },
};

const featureCards = [
  { icon: Search, title: 'Intelligent Search', desc: 'Find relevant case law instantly by describing your situation in plain English.' },
  { icon: FileText, title: 'Simplified Insights', desc: 'Get clear, case-backed explanations in seconds without the heavy legal jargon.' },
  { icon: ScaleIcon, title: 'Professional Grade', desc: 'Generate citations, arguments, and draft-ready templates for your practice.' },
  { icon: Shield, title: 'Verified Sources', desc: 'Results strictly from Supreme Court, High Courts, and eCourts for maximum reliability.' },
];

const processSteps = [
  { step: '01', title: 'Describe your situation', desc: 'Type your legal question or scenario naturally. No exact terminology needed.' },
  { step: '02', title: 'AI searches verified judgments', desc: 'Our engine scans 50,000+ authoritative Indian court records instantly.' },
  { step: '03', title: 'Get citation-backed insights', desc: 'Receive a structured, simplified answer with direct links to the original cases.' },
];

const faqs = [
  { question: 'Is this legal advice?', answer: 'No, Verdict Vision provides AI-powered legal information and research based on past judgments. It does not replace professional legal counsel.' },
  { question: 'How accurate is the data?', answer: 'We strictly source our data from verified public records including the Supreme Court of India, Delhi High Court, and eCourts to ensure high reliability.' },
  { question: 'Is my data private?', answer: 'Yes. Your queries are encrypted and processed securely. We do not use your searches to train public models or share them with third parties.' },
  { question: 'Which courts are covered?', answer: 'Currently, our database prioritizes the Supreme Court of India, Delhi High Court, and select regional eCourts, with continuous expansion.' },
];

// Reusable Spotlight Card component (Linear-style hover intent gradient)
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative rounded-2xl border border-border/40 bg-card/20 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-border/80 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              var(--spotlight-color, rgba(59, 130, 246, 0.15)),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full w-full p-6 z-10">
        {children}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/30 py-4 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-foreground/90 group-hover:text-primary transition-colors">{question}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-muted-foreground leading-relaxed pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const { scrollYProgress } = useScroll();
  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Set spotlight color based on theme for cards
  const spotlightColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(59, 130, 246, 0.08)';

  // Global mouse position state for the roaming anti-gravity spotlight
  const globalMouseX = useMotionValue(0);
  const globalMouseY = useMotionValue(0);

  useEffect(() => {
    function handleGlobalMouseMove(event: MouseEvent) {
      // Add slight offset so it centers around the cursor
      globalMouseX.set(event.clientX);
      globalMouseY.set(event.clientY);
    }

    // Only listen if screen size is desktop (touch devices don't have mouse move)
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }
  }, [globalMouseX, globalMouseY]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20" style={{ '--spotlight-color': spotlightColor } as React.CSSProperties}>

      {/* 
        Anti-gravity Global Floating Spotlight
        Follows the user cursor across the whole landing page.
      */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${globalMouseX}px ${globalMouseY}px,
              ${theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(59, 130, 246, 0.05)'},
              transparent 70%
            )
          `,
        }}
      />

      {/* Global Animated Animated Ambient Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -40, 0], opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/15 dark:bg-blue-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0], opacity: [0.05, 0.2, 0.05], scale: [1, 1.3, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cyan-500/10 dark:bg-teal-900/20 blur-[150px]"
        />
      </div>

      <PublicHeader
        rightSlot={
          <div className="flex items-center gap-3 relative z-50">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full hover:bg-muted/60 backdrop-blur-sm transition-colors" aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 border-0 shadow-sm transition-all duration-300 font-medium h-9 px-5 rounded-full">
                Get started
              </Button>
            </Link>
          </div>
        }
      />

      <main className="relative z-10">
        {/* Subtle grid pattern background */}
        <motion.div
          style={{ y: yBackground }}
          className="absolute inset-0 -z-10 h-[100vh] w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-40"
        />

        {/* Hero Section */}
        <section className="relative container mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-24 max-w-6xl">
          <motion.div
            className="text-center max-w-4xl mx-auto flex flex-col items-center"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item} className="mb-6 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 backdrop-blur-md shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              New: Legal Document Analysis Model
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight max-w-3xl mx-auto"
            >
              AI Legal Intelligence for{' '}
              <span className="relative inline-block">
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20 dark:opacity-30 blur-xl animate-pulse"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  Indian Law
                </span>
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-[700px] leading-relaxed font-medium">
              Understand complex legal situations with AI precision. Ask questions in plain English and get simplified, case-backed answers in seconds.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
              <Link href="/register" className="w-full sm:w-auto relative cursor-pointer z-50">
                <Button size="lg" className="group w-full sm:w-auto text-base px-8 h-12 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 font-medium">
                  Start Free — 10 Credits
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto relative cursor-pointer z-50">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 rounded-full px-8 border-border bg-background/50 backdrop-blur-md hover:bg-muted/50 transition-all duration-300 font-medium tracking-tight">
                  View Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground/80 dark:text-muted-foreground/60"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Built on 50,000+ judgments</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Updated from eCourts</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" /> For citizens & lawyers</div>
            </motion.div>
          </motion.div>
        </section>

        {/* Divider */}
        <div className="h-px w-full max-w-6xl mx-auto bg-gradient-to-r from-transparent via-border to-transparent opacity-50 my-4 md:my-8" />

        {/* Feature cards using SpotlightCard */}
        <section className="container mx-auto px-4 py-16 md:py-20 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-6"
          >
            <div className="max-w-2xl mx-auto md:mx-0">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful legal research at your fingertips</h2>
              <p className="text-muted-foreground text-lg">Everything you need to analyze, understand, and act upon Indian legal text with confidence.</p>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={container}
          >
            {featureCards.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={item} className="h-full">
                <SpotlightCard className="h-full">
                  <div className="flex flex-col h-full pointer-events-none">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-6 ring-1 ring-blue-500/10 dark:ring-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3 tracking-tight text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-auto">{desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works (3 Steps) */}
        <section className="container mx-auto px-4 py-20 md:py-24 max-w-6xl relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center mb-16 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">From complex situation to clear legal insight in three simple steps.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={container}
          >
            <div className="hidden md:block absolute top-[34px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {processSteps.map(({ step, title, desc }) => (
              <motion.div key={step} variants={item} className="flex flex-col items-center text-center group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border text-lg font-bold text-foreground mb-6 shadow-sm shadow-black/5 group-hover:border-blue-500/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">
                  {step}
                </div>
                <h3 className="font-semibold text-xl mb-3 tracking-tight">{title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px]">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Example Query Preview */}
        <section id="demo" className="container mx-auto px-4 py-20 md:py-24 max-w-5xl relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl dark:shadow-blue-900/10 overflow-hidden relative"
          >
            <div className="bg-muted/40 border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="bg-background/80 border border-border/50 rounded-lg px-4 py-1.5 flex items-center text-xs text-muted-foreground font-mono shadow-sm">
                <Lock className="h-3 w-3 mr-2 text-green-500/80" /> app.verdictvision.in
              </div>
              <div className="w-12" /> {/* Spacer for centering */}
            </div>

            <div className="p-6 md:p-12 relative overflow-hidden">
              {/* Decorative background glow in the mock UI */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex flex-col gap-8 max-w-3xl mx-auto relative z-10">
                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex justify-end"
                >
                  <div className="bg-foreground text-background dark:bg-blue-600 dark:text-white rounded-2xl rounded-tr-sm px-6 py-4 max-w-[85%] shadow-md text-sm md:text-base leading-relaxed font-medium">
                    Can a landlord evict a tenant without notice in Delhi?
                  </div>
                </motion.div>

                {/* AI Response Preview */}
                <div className="flex gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 mt-1"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30 shadow-sm">
                      <ScaleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-card/90 border border-border/60 rounded-2xl rounded-tl-sm p-6 md:p-8 backdrop-blur-md shadow-sm"
                  >
                    <p className="text-foreground/90 mb-5 text-sm md:text-base leading-relaxed">
                      Generally, a landlord cannot evict a tenant without serving a legal notice in Delhi. Under the <strong>Delhi Rent Control Act, 1958</strong>, specific grounds (such as non-payment of rent, subletting, or bonafide requirement) must be established.
                    </p>
                    <p className="text-foreground/90 mb-6 text-sm md:text-base leading-relaxed">
                      If the Act does not apply, the <strong>Transfer of Property Act, 1882</strong> requires a mandatory 15-day notice (for monthly tenancies) under Section 106 before initiating eviction proceedings.
                    </p>

                    <div className="pt-5 border-t border-border/40">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">References</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-background border border-border hover:border-blue-500/40 text-xs text-foreground/80 font-medium transition-all cursor-pointer shadow-sm group">
                          V. Dhanapal Chettiar vs Yesodai Ammal (1979)
                          <ArrowUpRight className="ml-1.5 h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 transition-colors" />
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-background border border-border hover:border-blue-500/40 text-xs text-foreground/80 font-medium transition-all cursor-pointer shadow-sm group">
                          Transfer of Property Act, §106
                          <ArrowUpRight className="ml-1.5 h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 transition-colors" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof / Authority */}
        <section className="border-y border-border/30 bg-muted/20 backdrop-blur-md py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
            <h2 className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-12">Trusted by Legal Professionals & Citizens</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">10,000+</span>
                <span className="text-sm font-medium text-muted-foreground">Searches Performed</span>
              </motion.div>
              <div className="hidden sm:block h-16 w-px bg-border/80" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">50K+</span>
                <span className="text-sm font-medium text-muted-foreground">Verified Judgments</span>
              </motion.div>
              <div className="hidden sm:block h-16 w-px bg-border/80" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-left"
              >
                <div className="flex -space-x-3 mb-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Used by modern lawyers</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 max-w-3xl relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about Verdict Vision.</p>
          </motion.div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 pb-24 md:pb-32 max-w-6xl relative z-20">
          <SpotlightCard className="!bg-zinc-950 dark:!bg-zinc-950/80 !border-zinc-800 p-0 overflow-hidden">
            {/* Dark background specific for CTA to make it pop even in light mode */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />

            <div className="relative px-8 py-20 md:py-24 md:px-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 z-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Are you a legal professional?</h2>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-0 font-medium">
                  Register with your Bar Council enrollment number to access professional outputs, case citations, counter-arguments, and draft templates.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/register?type=lawyer" className="relative z-50">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 border-0 shadow-lg shadow-white/10 transition-transform hover:scale-105 font-bold whitespace-nowrap text-base cursor-pointer"
                  >
                    Register as Lawyer <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/50 backdrop-blur-lg relative z-20">
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <SiteLogo href="/" />
              <p className="text-muted-foreground text-sm mt-6 max-w-sm leading-relaxed">
                AI Legal Intelligence for Indian Law. Find clarity in complex situations and access verified judgments instantly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-foreground uppercase mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-blue-500 transition-colors">Search</Link></li>
                <li><Link href="/register" className="hover:text-blue-500 transition-colors">Get started</Link></li>
                <li><Link href="/register?type=lawyer" className="hover:text-blue-500 transition-colors">For lawyers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-foreground uppercase mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} Verdict Vision. All rights reserved.</p>
            <p className="text-center md:text-right">
              Not a substitute for professional legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
