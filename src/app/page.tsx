'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Sparkles,
  Target,
  Briefcase,
  Users,
  Trophy,
  Check,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import { AuthModal } from '@/components/auth-modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const features = [
  {
    id: 'builder',
    title: "Resume Builder",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: FileText,
    desc: "Drag and drop builder with ATS-optimized templates.",
    preview: (
      <div className="w-full h-full p-2 space-y-2">
        <div className="h-2 w-1/2 bg-blue-500/20 rounded" />
        <div className="h-1.5 w-full bg-muted rounded" />
        <div className="h-1.5 w-full bg-muted rounded" />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    )
  },
  {
    id: 'analyzer',
    title: "AI Resume Analyzer",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    icon: Sparkles,
    desc: "Instant feedback on strengths and critical gaps.",
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 space-y-2">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-purple-500/20" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-purple-500" strokeWidth="3" strokeDasharray="75, 100" />
          </svg>
          <span className="absolute text-[10px] font-black">75%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded" />
      </div>
    )
  },
  {
    id: 'optimizer',
    title: "ATS Optimizer",
    color: "text-green-500",
    bg: "bg-green-500/10",
    icon: Target,
    desc: "Match your resume to specific job descriptions.",
    preview: (
      <div className="w-full h-full p-2 flex flex-wrap gap-1 items-center justify-center">
        <Badge className="bg-green-500/10 text-green-500 text-[8px] h-4">React ✓</Badge>
        <Badge className="bg-green-500/10 text-green-500 text-[8px] h-4">API ✓</Badge>
        <Badge className="bg-destructive/10 text-destructive text-[8px] h-4">Swift ✗</Badge>
        <Badge className="bg-green-500/10 text-green-500 text-[8px] h-4">Python ✓</Badge>
      </div>
    )
  },
  {
    id: 'matcher',
    title: "Smart Job Matching",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    icon: Briefcase,
    desc: "Discover roles that perfectly fit your unique skills.",
    preview: (
      <div className="w-full h-full p-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20" />
          <div className="h-2 w-2/3 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20" />
          <div className="h-2 w-1/2 bg-muted rounded" />
        </div>
      </div>
    )
  },
  {
    id: 'cover',
    title: "Cover Letter Generator",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    icon: Mail,
    desc: "Generate tailored letters in under 2 minutes.",
    preview: (
      <div className="w-full h-full p-3 space-y-1.5 opacity-50">
        <div className="h-1.5 w-1/3 bg-pink-500/20 rounded" />
        <div className="h-1 w-full bg-muted rounded" />
        <div className="h-1 w-full bg-muted rounded" />
        <div className="h-1 w-full bg-muted rounded" />
        <div className="h-1 w-2/3 bg-muted rounded" />
      </div>
    )
  },
  {
    id: 'recruiter',
    title: "Candidate Matching",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    icon: Users,
    desc: "Recruiter tools to rank candidates by job fit.",
    preview: (
      <div className="w-full h-full p-2 space-y-2">
        <div className="flex items-center justify-between p-1 bg-muted rounded border border-cyan-500/20">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <div className="h-1.5 w-12 bg-muted-foreground/20 rounded" />
          <div className="h-1.5 w-4 bg-green-500/20 rounded" />
        </div>
        <div className="flex items-center justify-between p-1 bg-muted rounded">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <div className="h-1.5 w-12 bg-muted-foreground/20 rounded" />
          <div className="h-1.5 w-4 bg-amber-500/20 rounded" />
        </div>
      </div>
    )
  },
];

function HomePageContent() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMode, setModalContext] = useState<{ title?: string; description?: string }>({});
  const [annual, setAnnual] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const openAuth = (title?: string, desc?: string) => {
    setModalContext({ title, description: desc });
    setIsAuthModalOpen(true);
  };

  const faqData = [
    {
      q: "Is CareerCraft AI free to use?",
      a: "Yes, our Free plan includes 5 AI credits every month and basic templates to get you started.",
    },
    {
      q: "What is an ATS and why does it matter?",
      a: "ATS stands for Applicant Tracking System. Most large companies use them to filter resumes automatically. We help you optimize your content to ensure you pass these machine filters.",
    },
    {
      q: "How do AI credits work?",
      a: "Credits are used for intense AI tasks like generating a full resume analysis or creating tailored cover letters. They reset every month on your billing date.",
    },
    {
      q: "Can I export my resume to PDF or Word?",
      a: "Yes, you can export to professional PDF format instantly. DOCX export is available on all paid plans.",
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We encrypt all your personal and resume data and never share it with third parties without your explicit consent.",
    },
  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomeHeader onOpenAuth={() => openAuth()} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={modalMode.title}
        description={modalMode.description}
      />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full" />

          <div className="container mx-auto px-4 md:px-8 lg:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left text */}
            <div className="w-full lg:w-[55%] space-y-8 text-center lg:text-left">
              <Badge variant="outline" className="py-1.5 px-4 bg-primary/5 border-primary/20 text-primary font-bold tracking-tight">
                ✨ Powered by Advanced Generative AI
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Land Your Dream Job <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Faster with AI
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Build ATS-optimized resumes, get instant AI feedback, and discover jobs that match your skills. All in one platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  size="lg"
                  className="btn-gradient h-12 md:h-14 px-8 md:px-10 rounded-xl text-base md:text-lg font-bold w-full sm:w-auto shadow-xl shadow-primary/30"
                  asChild
                >
                  <Link
                    href={user ? "/dashboard" : "#"}
                    onClick={(e) => !user && (e.preventDefault(), openAuth("Build Your Resume", "Sign up free to create your first ATS-optimized resume."))}
                  >
                    Build My Resume Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 md:h-14 px-8 md:px-10 rounded-xl text-base md:text-lg border border-foreground/10 hover:bg-muted/50 w-full sm:w-auto font-bold"
                  asChild
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>

            {/* Right card */}
            <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
              <div className="floating w-full max-w-[380px] md:max-w-[420px]">
                <Card className="glass p-6 w-full shadow-2xl rotate-2 border-primary/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resume Strength</p>
                        <p className="text-4xl font-black text-primary">87%</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Detected Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-500/10 text-green-500 border-none font-bold">React ✓</Badge>
                        <Badge className="bg-green-500/10 text-green-500 border-none font-bold">Node.js ✓</Badge>
                        <Badge className="bg-destructive/10 text-destructive border-none font-bold">Docker ✗</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-muted-foreground">ATS Match Probability</span>
                        <span className="font-black text-primary">91%</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: '91%' }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-8 lg:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 tracking-tight">Get Hired in 3 Simple Steps</h2>
            <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">The smartest path from a blank page to your next big offer.</p>

            <div className="relative flex flex-col md:flex-row gap-10 md:gap-6 max-w-5xl mx-auto">
              <div className="absolute top-[28%] left-0 w-full h-[2px] bg-gradient-to-r from-primary to-accent hidden md:block opacity-20" />
              {[
                { step: 1, title: "Upload or Build", icon: FileText, color: "bg-blue-500", desc: "Start from scratch or upload your existing PDF." },
                { step: 2, title: "Get AI Feedback", icon: Sparkles, color: "bg-purple-500", desc: "Our AI audits your resume against 23 key checkpoints." },
                { step: 3, title: "Apply and Get Hired", icon: Trophy, color: "bg-green-500", desc: "Download as PDF and send to your dream company." },
              ].map((item, i) => (
                <div key={i} className="flex-1 relative z-10 group">
                  <div className={cn(
                    "w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    item.color
                  )}>
                    <item.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <div className="bg-background px-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border/60 text-sm font-black mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-20 md:py-24 bg-muted/20 border-y border-border/40">
          <div className="container mx-auto px-4 md:px-8 lg:px-6">
            <div className="text-center mb-12 md:mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">Everything You Need to Level Up</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful tools built for modern Indian students and professionals.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
              {features.map((f) => (
                <Card
                  key={f.id}
                  className="card-hover overflow-hidden cursor-pointer group border-border/40 bg-card/50"
                  onClick={() => openAuth(f.title, f.desc)}
                >
                  <CardContent className="p-6 md:p-8 flex flex-col h-full">
                    <div className={cn("w-11 h-11 md:w-12 md:h-12 rounded-xl mb-5 md:mb-6 flex items-center justify-center shadow-lg", f.bg, f.color)}>
                      <f.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">{f.desc}</p>
                    <div className="h-28 md:h-32 bg-muted/40 rounded-2xl flex items-center justify-center border border-dashed border-border/60 relative overflow-hidden group-hover:bg-muted/60 transition-colors">
                      {f.preview}
                    </div>
                    <div className="mt-6 flex items-center font-bold text-sm text-primary pt-4 border-t border-border/10">
                      Try Tool Now <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-8 lg:px-6">
            <div className="text-center mb-12 md:mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg">Choose the perfect plan for your career goals.</p>

              <div className="flex items-center justify-center gap-4 pt-6">
                <span className={cn("text-sm font-bold transition-colors", !annual ? "text-primary" : "text-muted-foreground")}>Monthly</span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className="relative w-14 h-7 rounded-full bg-muted border border-border/60 transition-colors focus:outline-none"
                >
                  <div className={cn("absolute top-1 left-1 w-5 h-5 rounded-full bg-primary transition-transform duration-300", annual ? "translate-x-7" : "translate-x-0")} />
                </button>
                <span className={cn("text-sm font-bold flex items-center gap-2 transition-colors", annual ? "text-primary" : "text-muted-foreground")}>
                  Annual <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 font-black border-none px-2 py-0.5">SAVE 20%</Badge>
                </span>
              </div>
            </div>

            {/* Pricing grid — 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">

              {/* Free */}
              <Card className="card-hover flex flex-col border-border/40">
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black">₹0</span>
                    <span className="text-muted-foreground text-sm font-bold">/mo</span>
                  </div>
                  <ul className="space-y-3 text-sm mb-8 flex-1">
                    {["5 AI credits/month", "Basic templates", "2 resume drafts"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-medium">
                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-11 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Essentials */}
              <Card className="card-hover flex flex-col border-primary/20 bg-primary/[0.02]">
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">Essentials</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">₹{annual ? '159' : '199'}</span>
                      <span className="text-muted-foreground text-sm font-bold">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through font-bold">₹199/mo</span>}
                  </div>
                  <ul className="space-y-3 text-sm mb-8 flex-1">
                    {["50 AI credits", "ATS keyword suggestions", "10 resumes", "Cover letter generator"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-medium">
                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-11 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>
                    Choose Essentials
                  </Button>
                </CardContent>
              </Card>

              {/* Pro — highlighted with ring instead of scale */}
              <Card className="card-hover flex flex-col ring-2 ring-primary shadow-2xl shadow-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                  POPULAR
                </div>
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">₹{annual ? '319' : '399'}</span>
                      <span className="text-muted-foreground text-sm font-bold">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through font-bold">₹399/mo</span>}
                  </div>
                  <ul className="space-y-3 text-sm mb-8 flex-1">
                    {["Unlimited AI generation", "Advanced ATS optimization", "Unlimited resumes", "Job matching"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-medium">
                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full btn-gradient h-11 rounded-xl font-bold" onClick={() => openAuth()}>
                    Choose Pro
                  </Button>
                </CardContent>
              </Card>

              {/* Recruiter */}
              <Card className="card-hover flex flex-col border-border/40">
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">Recruiter</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">₹{annual ? '799' : '999'}</span>
                      <span className="text-muted-foreground text-sm font-bold">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through font-bold">₹999/mo</span>}
                  </div>
                  <ul className="space-y-3 text-sm mb-8 flex-1">
                    {["Everything in Pro", "AI Candidate Ranking", "Team Management", "Recruiter analytics"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-medium">
                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-11 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>
                    Choose Recruiter
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-center mt-12 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 md:py-24 bg-muted/20 border-y border-border/40">
          <div className="container mx-auto px-4 md:px-8 lg:px-6 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 tracking-tight">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-border/40 last:border-0"
                >
                  <AccordionTrigger className="group text-left font-semibold tracking-tight text-base md:text-lg py-4 md:py-6 hover:text-primary transition-colors">
                    {faq.q}
                  </AccordionTrigger>

                  <AccordionContent className="text-foreground/80 text-base leading-relaxed pb-2 md:pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-16 md:py-20 bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-4 md:px-8 py-4 lg:px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-[12px] p-1">
                <Image src="/logo.webp" alt="Logo" width={42} height={42} className="rounded-sm" />
              </div>
              <span className="text-2xl font-bold tracking-tight">CareerCraft AI</span>
            </Link>
            <p className="text-foreground/70 text-sm leading-relaxed max-w-xs">
              Empowering the next generation of Indian professionals with AI-powered career tools.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-black uppercase text-[10px] tracking-[2px] text-foreground/70">Product</h4>
            <ul className="space-y-2.5 text-sm font-medium text-foreground/70">
              <li><Link href="#features" className="hover:text-primary transition-colors mb-2">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors mb-2">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors mb-2">Blog</Link></li>
              <li><Link href="/resume-builder" className="hover:text-primary transition-colors mb-2">Resume Builder</Link></li>
            </ul>
          </div>

          {/* For You */}
          <div className="space-y-4">
            <h4 className="font-black uppercase text-[10px] tracking-[2px] text-foreground/70">For You</h4>
            <ul className="space-y-2.5 text-sm font-medium text-foreground/70">
              <li><Link href="/signup" className="hover:text-primary transition-colors mb-2">For Students</Link></li>
              <li><Link href="/signup" className="hover:text-primary transition-colors mb-2">For Professionals</Link></li>
              <li><Link href="/candidate-matcher" className="hover:text-primary transition-colors mb-2">For Recruiters</Link></li>
              <li><Link href="/job-matcher" className="hover:text-primary transition-colors mb-2">Job Matcher</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-black uppercase text-[10px] tracking-[2px] text-foreground/70">Support</h4>
            <ul className="space-y-2.5 text-sm font-medium text-foreground/70">
              <li><Link href="/contact" className="hover:text-primary transition-colors mb-2">Contact Us</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors mb-2">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors mb-2">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors mb-2">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-6 mt-16 pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold uppercase tracking-widest text-foreground/50">

          <p className="text-center md:text-left">
            © 2026 CareerCraft AI • Built by Hitarth Chauhan
          </p>

          <div className="flex items-center gap-8">

            <Link
              href="https://linkedin.com/in/chauhanhitarth6"
              target="_blank"
              className="hover:text-primary transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaLinkedin size={18} />
            </Link>

            <Link
              href="https://twitter.com"
              target="_blank"
              className="hover:text-primary transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaTwitter size={18} />
            </Link>

            <Link
              href="https://github.com/Hit246"
              target="_blank"
              className="hover:text-primary transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaGithub size={18} />
            </Link>

          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
}