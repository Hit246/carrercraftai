'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles, Check, Crown, Target, Star, Trophy, Diamond, HelpCircle, ArrowRight, PartyPopper, ShieldCheck, Zap, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AuthModal } from '@/components/auth-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PricingSettings {
  essentials: number;
  pro: number;
  recruiter: number;
  festiveDiscount: number;
  festiveName: string;
}

const featureVisuals: Record<string, React.ReactNode> = {
  "Intuitive Resume Builder": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-[10px] mt-4 shadow-sm group-hover:shadow-md transition-all">
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex gap-1.5 border-b">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        <span className="w-2 h-2 rounded-full bg-green-400" />
      </div>
      <div className="p-3 space-y-2 bg-white dark:bg-gray-950">
        <div className="flex gap-2">
          <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-2 w-2/3 bg-primary/20 rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-gray-50 dark:bg-gray-900 rounded" />
        <div className="h-8 w-full border border-dashed rounded flex flex-col items-center justify-center text-muted-foreground text-[8px] bg-muted/20 gap-1">
          <PlusCircle className="w-3 h-3" />
          <span>Add Experience</span>
        </div>
      </div>
    </div>
  ),
  "AI Resume Analyzer": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-950 mt-4 space-y-2 shadow-sm">
      <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3" /> Strength: Action Verbs
      </div>
      <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider">
        <Sparkles className="w-3 h-3" /> Fix: Quantify Metrics
      </div>
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 italic">
        "Lead team of 5 to increase..."
      </div>
    </div>
  ),
  "ATS Optimizer": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-950 mt-4 space-y-2 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-500 font-medium">ATS Match Score</span>
        <span className="text-green-500 font-bold text-xs">92%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-green-500 h-full rounded-full transition-all duration-1000" style={{ width: "92%" }} />
      </div>
      <div className="flex gap-1 flex-wrap pt-1">
        {["TypeScript", "Cloud", "Agile"].map((kw) => (
          <span key={kw} className="bg-green-50 dark:bg-green-900/30 text-green-600 px-1.5 py-0.5 rounded border border-green-200/50">
            {kw} ✓
          </span>
        ))}
      </div>
    </div>
  ),
  "Smart Job Matching": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-950 mt-4 space-y-2 shadow-sm">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-card">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center font-bold text-[8px] text-muted-foreground">TC</div>
            <div>
              <div className="font-bold">Software Engineer</div>
              <div className="text-[7px] text-muted-foreground">TechCorp • Remote</div>
            </div>
          </div>
          <Badge className="text-[7px] h-4 px-1.5 bg-green-500/10 text-green-600 border-none">95% Match</Badge>
        </div>
      ))}
    </div>
  ),
  "Cover Letter Generator": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-950 mt-4 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center mb-2">
            <div className="h-2 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-12 bg-primary/10 rounded-full" />
        </div>
        <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-900 rounded" />
        <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-900 rounded" />
        <div className="h-1.5 w-3/4 bg-gray-50 dark:bg-gray-900 rounded" />
        <div className="flex gap-2 mt-3">
            <div className="h-4 w-16 bg-primary/5 rounded border border-primary/10" />
            <div className="h-4 w-16 bg-muted rounded border" />
        </div>
      </div>
    </div>
  ),
  "Candidate Matching": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-950 mt-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-[8px]">JD</div>
          <div className="h-1.5 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
          <Badge variant="outline" className="ml-auto text-[7px] h-4 py-0 border-primary text-primary">RANK #1</Badge>
        </div>
        <div className="flex items-center gap-2 opacity-40">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <div className="h-1.5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  ),
};

const faqs = [
  {
    question: "Is CareerCraft AI free to use?",
    answer: "Yes! We offer a 'Free Forever' plan that allows you to create up to 2 resume versions and includes 5 AI credits every month to try out our premium analysis tools."
  },
  {
    question: "What is an ATS and why does it matter?",
    answer: "ATS stands for Applicant Tracking System. It's software used by 95% of Fortune 500 companies to filter resumes. CareerCraft AI's optimizer identifies missing keywords and formatting issues so you pass these automated filters."
  },
  {
    question: "How do AI credits work?",
    answer: "Credits are used for intensive AI tasks like generating a full resume analysis, tailoring a cover letter, or matching your profile to jobs. Free users get 5/month, while Pro and Recruiter plans enjoy unlimited AI access."
  },
  {
    question: "Can I export my resume to Word?",
    answer: "Absolutely. You can export your completed resume as a professional PDF (optimized for ATS) or as a fully editable DOCX file for further manual tweaks."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We take privacy seriously. Your resume data is used only to provide the requested AI analysis and is stored securely in encrypted Firestore databases."
  },
  {
    question: "What makes the Recruiter plan different?",
    answer: "The Recruiter plan is designed for hiring teams. It includes advanced tools like the AI Candidate Matcher, which allows you to upload batches of resumes and rank them against a job description in seconds."
  }
];

function HomePageContent() {
  const { user, loading } = useAuth();
  const [pricing, setPricing] = React.useState<PricingSettings>({
    essentials: 199,
    pro: 399,
    recruiter: 999,
    festiveDiscount: 0,
    festiveName: '',
  });
  const [isLoadingPricing, setIsLoadingPricing] = React.useState(true);
  const [annual, setAnnual] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [modalContext, setModalContext] = React.useState<{ title?: string; description?: string }>({});

  React.useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPricing(docSnap.data() as PricingSettings);
        }
      } catch (e) {
        console.error("Error fetching home pricing:", e);
      } finally {
        setIsLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  const calculatePrice = (base: number) => {
    let final = base;
    if (pricing.festiveDiscount > 0) {
      final = final * (1 - pricing.festiveDiscount / 100);
    }
    if (annual) {
      final = final * 0.8; // 20% Annual Discount
    }
    return Math.floor(final);
  };

  const handleActionClick = (e: React.MouseEvent, title: string, desc: string, href: string) => {
    if (!user) {
      e.preventDefault();
      setModalContext({ title: `Unlock ${title}`, description: desc });
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <HomeHeader onOpenAuth={() => {
        setModalContext({ title: "Welcome to CareerCraft AI", description: "Join 10,000+ job seekers landing roles at top tech companies." });
        setIsAuthModalOpen(true);
      }} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        title={modalContext.title}
        description={modalContext.description}
      />
      <main className="flex-1">
        <section className="relative py-16 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full text-primary border-primary/30 text-xs font-semibold bg-primary/5">
              <Sparkles className="w-3.5 h-3.5 mr-2 -ml-1 text-primary animate-pulse" />
              Powered by Advanced Generative AI
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              Craft Your Future <br className="hidden md:block" /> with Intelligence
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
              Build the perfect resume, get AI-driven feedback, and find jobs that truly match your skills. CareerCraft AI is your ultimate partner in professional growth.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Button size="lg" asChild className="w-full sm:w-auto shadow-2xl shadow-primary/25 h-12 px-8 group">
                <Link 
                  href={user ? '/resume-builder' : '#'} 
                  onClick={(e) => handleActionClick(e, "Resume Builder", "Start building your professional resume today.", "/resume-builder")}
                >
                  Create My Resume
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 px-8">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32 bg-slate-50/50 dark:bg-slate-900/10 border-y">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-bold text-primary text-xs sm:text-sm uppercase tracking-widest mb-2">Our Features</p>
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">Everything you need to level up</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                From creation to application, our intelligent tools support you at every step.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Intuitive Resume Builder", desc: "Create professional, version-controlled resumes with our intuitive builder and live preview.", icon: FileText, href: "/resume-builder" },
                { title: "AI Resume Analyzer", desc: "Get instant, actionable feedback to improve your resume's impact, clarity, and keyword optimization.", icon: Sparkles, href: "/resume-analyzer" },
                { title: "ATS Optimizer", desc: "Compare your resume against a job description to identify missing keywords and get a match score.", icon: Target, href: "/ats-optimizer" },
                { title: "Smart Job Matching", desc: "Discover job opportunities that perfectly align with your unique skills and aspirations.", icon: Briefcase, href: "/job-matcher" },
                { title: "Cover Letter Generator", desc: "Instantly generate a personalized cover letter for any job description, based on your resume.", icon: FileText, href: "/cover-letter-generator" },
                { title: "Candidate Matching", desc: "For recruiters: efficiently find the best candidates for your roles from a diverse pool.", icon: Users, href: "/candidate-matcher" },
              ].map((f) => (
                <Link 
                  key={f.title} 
                  href={user ? f.href : '#'} 
                  onClick={(e) => handleActionClick(e, f.title, f.desc, f.href)}
                  className="group block"
                >
                  <Card className="h-full border hover:border-primary/50 transition-all duration-500 relative overflow-hidden bg-background hover:shadow-2xl hover:-translate-y-1">
                    <CardHeader>
                      <div className="bg-primary/10 text-primary w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary/20 to-primary/5">
                        <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl flex items-center justify-between font-headline">
                        {f.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                      <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                        {featureVisuals[f.title]}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-bold text-primary text-xs sm:text-sm uppercase tracking-widest mb-2">Flexible Pricing</p>
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">The right plan for your needs</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                {pricing.festiveDiscount > 0 ? (
                  <span className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/5 py-2 px-4 rounded-full w-fit mx-auto border border-primary/20">
                    <PartyPopper className="h-4 w-4" /> 
                    {pricing.festiveName}: Extra {pricing.festiveDiscount}% Off Storewide!
                  </span>
                ) : 'Choose the plan that’s right for you.'}
              </p>

              <div className="flex items-center justify-center gap-4 mt-10">
                <span className={`text-sm font-bold transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner ${annual ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${annual ? "translate-x-7" : "translate-x-0"}`} />
                </button>
                <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                  Annual
                  <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 font-black h-5 py-0 px-2 uppercase tracking-tighter">
                    Save 20%
                  </Badge>
                </span>
              </div>
            </div>

            {isLoadingPricing ? (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="flex flex-col h-[450px]">
                    <CardHeader className="space-y-3">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 pt-4">
                      <Skeleton className="h-10 w-1/3" />
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-6 border-t">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
                <Card className="flex flex-col hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl"><Star className="text-yellow-500 w-5 h-5" /> Free</CardTitle>
                    <CardDescription className="text-sm">For students exploring jobs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 text-left">
                    <p className="text-4xl font-bold font-headline">₹0<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Basic templates</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6 border-t">
                    <Button asChild variant="outline" className="w-full" onClick={() => !user && setIsAuthModalOpen(true)}>
                      <Link href={user ? '/dashboard' : '#'}>Get Started</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="flex flex-col relative overflow-hidden hover:shadow-xl transition-all border-blue-500/20">
                  {(pricing.festiveDiscount > 0 || annual) && <Badge className="absolute top-3 right-3 bg-green-500 animate-pulse text-[10px] h-5">SALE</Badge>}
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl"><Trophy className="text-slate-400 w-5 h-5" /> Essentials</CardTitle>
                    <CardDescription className="text-sm">For active job seekers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 text-left">
                    <div className="flex flex-col">
                      {(pricing.festiveDiscount > 0 || annual) && (
                        <span className="text-xs text-muted-foreground line-through decoration-destructive">₹{pricing.essentials}</span>
                      )}
                      <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.essentials)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                      {annual && <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-tighter">Billed annually</p>}
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6 border-t">
                    <Button asChild className="w-full" onClick={() => !user && setIsAuthModalOpen(true)}>
                      <Link href={user ? '/pricing' : '#'}>Choose Essentials</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary border-2 relative flex flex-col overflow-hidden shadow-2xl scale-105 z-10">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-400" />
                  <Badge className="absolute top-4 right-4 text-[10px] bg-primary" variant="default">POPULAR</Badge>
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl"><Crown className="text-amber-500 w-5 h-5" /> Pro</CardTitle>
                    <CardDescription className="text-sm">For top-tier professionals.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 text-left">
                    <div className="flex flex-col">
                      {(pricing.festiveDiscount > 0 || annual) && (
                        <span className="text-xs text-muted-foreground line-through decoration-destructive">₹{pricing.pro}</span>
                      )}
                      <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.pro)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                      {annual && <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-tighter">Billed annually</p>}
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6 border-t">
                    <Button asChild className="w-full" onClick={() => !user && setIsAuthModalOpen(true)}>
                      <Link href={user ? '/pricing' : '#'}>Choose Pro</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="flex flex-col relative overflow-hidden hover:shadow-xl transition-all border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl"><Diamond className="text-blue-500 w-5 h-5" /> Recruiter</CardTitle>
                    <CardDescription className="text-sm">For hiring teams.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 text-left">
                    <div className="flex flex-col">
                      {(pricing.festiveDiscount > 0 || annual) && (
                        <span className="text-xs text-muted-foreground line-through decoration-destructive">₹{pricing.recruiter}</span>
                      )}
                      <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.recruiter)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                      {annual && <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-tighter">Billed annually</p>}
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Team Management</li>
                      <li className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6 border-t">
                    <Button asChild variant="secondary" className="w-full" onClick={() => !user && setIsAuthModalOpen(true)}>
                      <Link href={user ? '/pricing' : '#'}>Choose Recruiter</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            <p className="text-center text-[10px] text-muted-foreground mt-12 font-bold uppercase tracking-widest bg-muted/30 py-2 px-6 rounded-full w-fit mx-auto border border-dashed">
              🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>

        <section id="faq" className="py-24 md:py-32 bg-slate-50/50 dark:bg-slate-900/10 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="font-bold text-primary text-xs sm:text-sm uppercase tracking-widest mb-2">Support</p>
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">Common Questions</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                Everything you need to know about CareerCraft AI.
              </p>
            </div>
            <div className="max-w-3xl mx-auto bg-background rounded-2xl border p-2 sm:p-6 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 border-muted-foreground/10 px-4">
                    <AccordionTrigger className="text-left font-bold py-6 hover:no-underline text-sm sm:text-base group">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <HelpCircle className="h-4 w-4 text-primary" />
                        </div>
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-sm pl-12">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 bg-[#0d0f14]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.webp" alt="CareerCraft AI" width={32} height={32} className="rounded-lg shadow-lg" />
                <span className="font-bold text-white text-xl font-headline tracking-tight">CareerCraft AI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Empowering the next generation of professionals in India with cutting-edge AI career tools.
              </p>
            </div>

            <a href="https://www.producthunt.com/posts/careercraft-ai" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=careercraft-ai&theme=light"
                alt="CareerCraft AI - Featured on Product Hunt"
                width="250" height="54"
                className="w-[200px] h-[44px] sm:w-[250px] sm:h-[54px]"
              />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 border-y border-gray-800/50 py-16">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Product</p>
              <ul className="space-y-4">
                {[
                  { label: "Features", href: "/#features" },
                  { label: "Pricing", href: "/#pricing" },
                  { label: "Blog", href: "/blog" },
                  { label: "Resume Builder", href: "/resume-builder" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Resources</p>
              <ul className="space-y-4">
                {[
                  { label: "ATS Guide", href: "/blog/ats-resume-format-freshers-india" },
                  { label: "Cover Letters", href: "/blog/cover-letter-format-india-2026" },
                  { label: "Career Tips", href: "/blog" },
                  { label: "Job Matcher", href: "/job-matcher" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Legal</p>
              <ul className="space-y-4">
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Refund Policy", href: "/cancellation" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Connect</p>
              <ul className="space-y-4">
                {[
                  { label: "Support", href: "/support" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Email Admin", href: "mailto:support@careercraftai.tech" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-2 text-gray-600 bg-white/5 w-fit py-1.5 px-3 rounded-lg border border-white/10">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-tighter">Secured by Razorpay</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
            <p className="text-xs text-gray-600 font-medium">© {new Date().getFullYear()} CareerCraft AI. Proudly built in India.</p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Built by Hitarth Chauhan</span>
              <div className="flex items-center gap-3">
                {[
                  { label: "GitHub", href: "https://github.com/Hit246", icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12c0-5.523-4.477-10-10-10z"/></svg> },
                  { label: "LinkedIn", href: "https://linkedin.com/in/chauhanhitarth6", icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shadow-sm"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
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
  )
}
