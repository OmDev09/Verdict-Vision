'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  Shield,
  ScaleIcon,
  Moon,
  Sun,
  CheckCircle2,
  Target,
  Zap,
  Lock,
  ArrowRight,
  Users,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/public-header';
import { useTheme } from '@/contexts/theme-context';
import { SiteLogo } from '@/components/site-logo';

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 * i },
  }),
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const featureCards = [
  { icon: Search, title: 'Search situations', desc: 'Describe your situation in plain language and get relevant case law.' },
  { icon: FileText, title: 'Simplified advice', desc: 'AI explains outcomes and next steps without heavy jargon.' },
  { icon: ScaleIcon, title: 'For lawyers', desc: 'Citations, arguments, and draft-ready templates.' },
  { icon: Shield, title: 'Indian law only', desc: 'Supreme Court, Delhi High Court, eCourts — compliant and transparent.' },
];

const whyUs = [
  { icon: Zap, title: 'AI-Powered', text: 'Instant answers powered by advanced language models and verified Indian case law.' },
  { icon: Lock, title: 'Secure & Private', text: 'Your queries and data are handled with strict privacy and security standards.' },
  { icon: Target, title: 'Accuracy Focus', text: 'We surface real judgments and citations so you can verify every claim.' },
];

const whatWeSolve = [
  'Citizens struggle to understand legal notices and options.',
  'Lawyers spend hours on case law research and citation formatting.',
  'Access to Supreme Court and High Court judgments is fragmented.',
  'Legal language creates a barrier between people and their rights.',
];

const processSteps = [
  { step: 1, title: 'Describe your situation', desc: 'Type your legal question or situation in simple language.' },
  { step: 2, title: 'AI finds relevant cases', desc: 'Our system searches thousands of Indian judgments and retrieves the most relevant ones.' },
  { step: 3, title: 'Get clear guidance', desc: 'Receive a plain-language explanation plus citations and next steps.' },
];

const team = [
  { name: 'Legal & Product', role: 'Building tools that bridge law and people.' },
  { name: 'Engineering', role: 'AI, search, and security for reliable legal assistance.' },
  { name: 'Research', role: 'Curating and verifying Indian legal sources.' },
];

export default function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen page-gradient">
      <PublicHeader
        rightSlot={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-lg shadow-primary/20">Get started</Button>
            </Link>
          </div>
        }
      />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={item}
              className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              AI-Powered Legal Assistant for Indian Law
            </motion.h1>
            <motion.p variants={item} className="text-xl text-muted-foreground mb-10">
              Understand your legal situation in simple terms. Search Supreme Court & Delhi High Court judgments. For citizens and lawyers.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-base px-8 shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all duration-300">
                  Start free — 10 credits
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="text-base">
                  Try search
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature cards - transparent with hover */}
        <section className="container mx-auto px-4 mb-24">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
          >
            {featureCards.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={item}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                className="card-transparent p-6 cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Why Us */}
        <section className="container mx-auto px-4 mb-24">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Verdict Vision?
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            We combine AI with trusted Indian legal sources to give you clarity and confidence.
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={container}
          >
            {whyUs.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="card-transparent p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Vision / What we solve */}
        <section className="container mx-auto px-4 mb-24">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What We Solve
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our vision is to make Indian law accessible to everyone — from citizens to practising advocates.
          </motion.p>
          <motion.ul
            className="max-w-2xl mx-auto space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
          >
            {whatWeSolve.map((point, i) => (
              <motion.li
                key={i}
                variants={item}
                className="flex items-start gap-3 card-transparent p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{point}</span>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* The Process */}
        <section className="container mx-auto px-4 mb-24">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Three simple steps from your question to clear, cited guidance.
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={container}
          >
            {processSteps.map(({ step, title, desc }) => (
              <motion.div key={step} variants={item} className="relative">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="card-transparent p-6 h-full"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
                    {step}
                  </span>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </motion.div>
                {step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-muted-foreground/50">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Our Team */}
        <section className="container mx-auto px-4 mb-24">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Team
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Legal, engineering, and research working together to make law accessible.
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={container}
          >
            {team.map(({ name, role }) => (
              <motion.div
                key={name}
                variants={item}
                whileHover={{ y: -4 }}
                className="card-transparent p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Lawyer CTA */}
        <section className="container mx-auto px-4 mb-24">
          <motion.div
            className="group relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/20" />
            <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/30 dark:border-emerald-400/40 group-hover:border-emerald-400/60 dark:group-hover:border-emerald-400/50 transition-colors duration-300" />
            <div className="relative rounded-3xl p-8 md:p-12 text-center border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-xl shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/5 group-hover:shadow-2xl group-hover:shadow-emerald-500/20 dark:group-hover:shadow-emerald-500/10 transition-shadow duration-300">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Are you a lawyer?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Register with your Bar Council enrollment number for professional outputs: citations, counter-arguments, and petition drafts.
              </p>
              <Link href="/register?type=lawyer">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Button
                    size="lg"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                  >
                    Register as lawyer
                  </Button>
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 dark:bg-background/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <SiteLogo href="/" />
              <p className="text-muted-foreground text-sm mt-4 max-w-sm">
                AI-powered legal assistant for Indian law. Understand situations, get cited guidance, and access Supreme Court & High Court judgments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground transition-colors">Search</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Get started</Link></li>
                <li><Link href="/register?type=lawyer" className="hover:text-foreground transition-colors">For lawyers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@verdictvision.in</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> India</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Verdict Vision. All rights reserved.</p>
            <p className="text-center sm:text-right max-w-xl">
              Verdict Vision provides AI-generated legal information and does not replace professional legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
