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
  ShieldCheck,
  ChevronDown,
  Mail,
  ZapOff,
  LayoutDashboard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import { AuthModal } from '@/components/auth-modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const socialProofLogos = [
  "IIT Bombay", "IIM Ahmedabad", "BITS Pilani", "TCS", "Infosys", "Google", "Microsoft", "Wipro", "Accenture", "Flipkart"
];

const features = [
  { 
    id: 'builder', 
    title: "Resume Builder", 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    icon: FileText, 
    desc: "Drag & drop builder with ATS-optimized templates.",
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
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full" />
          
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-[60%] space-y-8 text-center lg:text-left">
              <Badge variant="outline" className="py-1.5 px-4 bg-primary/5 border-primary/20 text-primary font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-2" /> ✨ Powered by Advanced Generative AI
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Land Your Dream Job <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Faster with AI</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Build ATS-optimized resumes, get instant AI feedback, and discover jobs that match your skills — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="btn-gradient h-14 px-10 rounded-xl text-lg font-bold w-full sm:w-auto" asChild>
                  <Link href={user ? "/dashboard" : "#"} onClick={(e) => !user && (e.preventDefault(), openAuth("Build Your Resume", "Sign up free to create your first ATS-optimized resume."))}>
                    Build My Resume Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-10 rounded-xl text-lg border border-foreground/20 hover:bg-muted/50 w-full sm:w-auto" asChild>
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>

            <div className="lg:w-[40%] relative">
              <div className="floating">
                <Card className="glass p-6 w-full max-w-[400px] shadow-2xl rotate-2">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Resume Strength</p>
                        <p className="text-3xl font-bold">87%</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Detected Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-500/10 text-green-500 border-none">React ✓</Badge>
                        <Badge className="bg-green-500/10 text-green-500 border-none">Node.js ✓</Badge>
                        <Badge className="bg-destructive/10 text-destructive border-none">Docker ✗</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-muted-foreground">ATS Match Probability</span>
                        <span className="font-bold text-primary">91%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '91%' }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee social proof */}
        <section className="py-12 bg-muted/30 border-y overflow-hidden">
          <div className="marquee gap-12 text-lg font-bold text-muted-foreground/50 uppercase tracking-[4px]">
            {[...socialProofLogos, ...socialProofLogos].map((logo, i) => (
              <span key={i} className="flex items-center gap-12">
                {logo} <span className="text-primary">•</span>
              </span>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Get Hired in 3 Simple Steps</h2>
            <p className="text-muted-foreground text-lg mb-16">The smartest path from a blank page to your next big offer.</p>
            
            <div className="relative flex flex-col md:flex-row gap-12 md:gap-4 max-w-5xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-accent hidden md:block -translate-y-1/2 opacity-20 dashed" />
              {[
                { step: 1, title: "Upload or Build", icon: FileText, color: "bg-blue-500", desc: "Start from scratch or upload your existing PDF." },
                { step: 2, title: "Get AI Feedback", icon: Sparkles, color: "bg-purple-500", desc: "Our AI audits your resume against 23 key checkpoints." },
                { step: 3, title: "Apply & Get hired", icon: Trophy, color: "bg-green-500", desc: "Download as PDF and send to your dream company." },
              ].map((item, i) => (
                <div key={i} className="flex-1 relative z-10 group">
                  <div className={cn("w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-110", item.color)}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="bg-background px-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted border text-xs font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Everything You Need to Level Up</h2>
              <p className="text-muted-foreground text-lg">Powerful tools built for modern Indian students and professionals.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((f) => (
                <Card key={f.id} className="card-hover overflow-hidden cursor-pointer group" onClick={() => openAuth(f.title, f.desc)}>
                  <CardContent className="p-8">
                    <div className={cn("w-12 h-12 rounded-xl mb-6 flex items-center justify-center", f.bg, f.color)}>
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{f.desc}</p>
                    <div className="h-24 bg-muted/50 rounded-xl flex items-center justify-center border border-dashed relative overflow-hidden">
                      {f.preview}
                    </div>
                    <div className="mt-6 flex items-center font-bold text-sm text-primary group">
                      Try it now <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-headline">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg">Choose the perfect plan for your career goals.</p>
              
              <div className="flex items-center justify-center gap-4 pt-4">
                <span className={cn("text-sm font-medium", !annual && "text-primary")}>Monthly</span>
                <button 
                  onClick={() => setAnnual(!annual)}
                  className="relative w-14 h-7 rounded-full bg-muted transition-colors focus:outline-none"
                >
                  <div className={cn("absolute top-1 left-1 w-5 h-5 rounded-full bg-primary transition-transform", annual ? "translate-x-7" : "translate-x-0")} />
                </button>
                <span className={cn("text-sm font-medium flex items-center gap-2", annual && "text-primary")}>
                  Annual <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">Save 20%</Badge>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Free Plan */}
              <Card className="card-hover flex flex-col">
                <CardContent className="p-8 flex-1">
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">₹0</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <ul className="space-y-4 text-sm mb-8">
                    {[ "5 AI credits/month", "Basic templates", "2 resume drafts" ].map(item => (
                      <li key={item} className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> {item}</li>
                    ))}
                  </ul>
                  <Button className="w-full h-12 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>Get Started Free</Button>
                </CardContent>
              </Card>

              {/* Essentials */}
              <Card className="card-hover flex flex-col border-primary/20">
                <CardContent className="p-8 flex-1">
                  <h3 className="text-xl font-bold mb-2">Essentials</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{annual ? '159' : '199'}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through">₹199/mo</span>}
                  </div>
                  <ul className="space-y-4 text-sm mb-8">
                    {[ "50 AI credits", "ATS keyword suggestions", "10 resumes", "Cover letter generator" ].map(item => (
                      <li key={item} className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> {item}</li>
                    ))}
                  </ul>
                  <Button className="w-full h-12 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>Choose Essentials</Button>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="card-hover flex flex-col border-primary shadow-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-lg">POPULAR</div>
                <CardContent className="p-8 flex-1">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{annual ? '319' : '399'}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through">₹399/mo</span>}
                  </div>
                  <ul className="space-y-4 text-sm mb-8">
                    {[ "Unlimited AI generation", "Advanced ATS optimization", "Unlimited resumes", "Job matching" ].map(item => (
                      <li key={item} className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> {item}</li>
                    ))}
                  </ul>
                  <Button className="w-full btn-gradient h-12 rounded-xl font-bold" onClick={() => openAuth()}>Choose Pro</Button>
                </CardContent>
              </Card>

              {/* Recruiter */}
              <Card className="card-hover flex flex-col">
                <CardContent className="p-8 flex-1">
                  <h3 className="text-xl font-bold mb-2">Recruiter</h3>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{annual ? '799' : '999'}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {annual && <span className="text-xs text-muted-foreground line-through">₹999/mo</span>}
                  </div>
                  <ul className="space-y-4 text-sm mb-8">
                    {[ "Everything in Pro", "AI Candidate Ranking", "Team Management", "Recruiter analytics" ].map(item => (
                      <li key={item} className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> {item}</li>
                    ))}
                  </ul>
                  <Button className="w-full h-12 rounded-xl font-bold" variant="outline" onClick={() => openAuth()}>Choose Recruiter</Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-center mt-12 text-sm text-muted-foreground">
              🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Is CareerCraft AI free to use?", a: "Yes, our Free plan includes 5 AI credits every month and basic templates to get you started." },
                { q: "What is an ATS and why does it matter?", a: "ATS stands for Applicant Tracking System. Most large companies use them to filter resumes automatically. We help you optimize your content to ensure you pass these machine filters." },
                { q: "How do AI credits work?", a: "Credits are used for intense AI tasks like generating a full resume analysis or creating tailored cover letters. They reset every month on your billing date." },
                { q: "Can I export my resume to PDF or Word?", a: "Yes, you can export to professional PDF format instantly. DOCX export is available on all paid plans." },
                { q: "Is my data secure?", a: "Absolutely. We encrypt all your personal and resume data and never share it with third parties without your explicit consent." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-0">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dot-grid.png')] opacity-10" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6 relative z-10">Ready to Build Your Dream Career?</h2>
            <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto relative z-10">
              Join thousands of professionals landing roles at top tech companies like Google, Microsoft, and TCS.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-12 rounded-xl text-lg font-bold relative z-10 shadow-xl" onClick={() => openAuth()}>
              Start for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-20 bg-card/30">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.webp" alt="Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-2xl font-bold font-headline">CareerCraft AI</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering the next generation of Indian professionals with AI-powered career tools.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/resume-builder" className="hover:text-primary">Resume Builder</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">For You</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/signup" className="hover:text-primary">For Students</Link></li>
              <li><Link href="/signup" className="hover:text-primary">For Professionals</Link></li>
              <li><Link href="/candidate-matcher" className="hover:text-primary">For Recruiters</Link></li>
              <li><Link href="/job-matcher" className="hover:text-primary">Job Matcher</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/support" className="hover:text-primary">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
          <p>© 2026 CareerCraft AI. Built by Hitarth Chauhan</p>
          <div className="flex gap-6">
            <Link href="https://linkedin.com" className="hover:text-primary">LinkedIn</Link>
            <Link href="https://twitter.com" className="hover:text-primary">Twitter</Link>
            <Link href="https://github.com" className="hover:text-primary">GitHub</Link>
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