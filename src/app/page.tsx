'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles, Check, Crown, Target, Star, Trophy, Diamond, Key, PartyPopper, Loader2, Sparkles as SparklesIcon, FileSearch, Zap, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PricingSettings {
  essentials: number;
  pro: number;
  recruiter: number;
  festiveDiscount: number;
  festiveName: string;
}

const featureVisuals: Record<string, React.ReactNode> = {
  "Intuitive Resume Builder": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-[10px] mt-4">
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex gap-1.5">
        <span className="w-2 pill h-2 rounded-full bg-red-400" />
        <span className="w-2 pill h-2 rounded-full bg-yellow-400" />
        <span className="w-2 pill h-2 rounded-full bg-green-400" />
      </div>
      <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-2 w-2/3 bg-primary/20 rounded" />
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-8 w-full border border-dashed rounded flex items-center justify-center text-muted-foreground text-[8px]">
          + Drag & Drop Section
        </div>
      </div>
    </div>
  ),
  "AI Resume Analyzer": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-900 mt-4 space-y-2">
      <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-wider">
        <Check className="w-3 h-3" /> Strength: Action Verbs
      </div>
      <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider">
        <SparklesIcon className="w-3 h-3" /> Suggestion: Quantify Metrics
      </div>
      <div className="p-2 bg-muted rounded italic">
        "Increased sales by 20%..."
      </div>
    </div>
  ),
  "ATS Optimizer": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-900 mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-500">Match Score</span>
        <span className="text-green-500 font-bold">87%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "87%" }} />
      </div>
      <div className="flex gap-1 flex-wrap">
        {["React", "Node.js", "SQL"].map((kw) => (
          <span key={kw} className="bg-green-100 dark:bg-green-900/30 text-green-600 px-1.5 py-0.5 rounded">
            {kw} ✓
          </span>
        ))}
        <span className="bg-red-100 dark:bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded">Docker ✗</span>
      </div>
    </div>
  ),
  "Smart Job Matching": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-900 mt-4 space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-1.5 border rounded">
          <div>
            <div className="font-bold">Software Engineer</div>
            <div className="text-[8px] text-muted-foreground">Google • Mountain View</div>
          </div>
          <div className="text-primary font-bold">95% Match</div>
        </div>
      ))}
    </div>
  ),
  "Cover Letter Generator": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-900 mt-4">
      <div className="space-y-1">
        <div className="h-1.5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-1.5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-4 w-1/3 bg-primary/10 rounded mt-2 border border-primary/20" />
      </div>
    </div>
  ),
  "Candidate Matching": (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] bg-white dark:bg-gray-900 mt-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary/20" />
          <div className="h-1.5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          <Badge variant="outline" className="ml-auto text-[8px] h-4">Rank #1</Badge>
        </div>
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-4 h-4 rounded-full bg-muted" />
          <div className="h-1.5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
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
  const { user } = useAuth();
  const [pricing, setPricing] = React.useState<PricingSettings>({
    essentials: 199,
    pro: 399,
    recruiter: 999,
    festiveDiscount: 0,
    festiveName: '',
  });
  const [isLoadingPricing, setIsLoadingPricing] = React.useState(true);
  const [annual, setAnnual] = React.useState(false);

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

  const getStartedLink = user ? '/dashboard' : '/signup';
  const pricingLink = user ? '/pricing' : '/signup';

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <HomeHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CareerCraft AI",
              url: "https://careercraftai.tech",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "AI-powered platform to build resumes, analyze ATS fit, generate cover letters, and match jobs.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "120",
              },
            }),
          }}
        />
        <section className="relative py-16 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full text-primary border-primary/50 text-[10px] sm:text-xs">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 -ml-1" />
              Powered by Generative AI
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl lg:text-7xl">
              Craft Your Future with AI
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8">
              Build the perfect resume, get AI-driven feedback, and find jobs that truly match your skills. CareerCraft AI is your ultimate partner in professional growth.
            </p>

            {/* Product Hunt Badge */}
            <div className="flex justify-center mb-10">
              <a href="https://www.producthunt.com/posts/careercraft-ai" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=careercraft-ai&theme=light"
                  alt="CareerCraft AI - Featured on Product Hunt"
                  width="200" height="44"
                  className="w-[200px] h-[44px] sm:w-[250px] sm:h-[54px]"
                />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href={getStartedLink}>Create My Resume</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32 bg-card border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-semibold text-primary text-sm sm:text-base">Our Features</p>
              <h2 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">Everything you need to level up your career</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                From creation to application, our intelligent tools support you at every step.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Intuitive Resume Builder", desc: "Create professional, version-controlled resumes with our intuitive builder and live preview.", icon: FileText },
                { title: "AI Resume Analyzer", desc: "Get instant, actionable feedback to improve your resume's impact, clarity, and keyword optimization.", icon: Sparkles },
                { title: "ATS Optimizer", desc: "Compare your resume against a job description to identify missing keywords and get a match score.", icon: Target },
                { title: "Smart Job Matching", desc: "Discover job opportunities that perfectly align with your unique skills and aspirations.", icon: Briefcase },
                { title: "Cover Letter Generator", desc: "Instantly generate a personalized cover letter for any job description, based on your resume.", icon: FileText },
                { title: "Candidate Matching", desc: "For recruiters: efficiently find the best candidates for your roles from a diverse pool.", icon: Users },
              ].map((f) => (
                <Card key={f.title} className="border hover:border-primary transition-all duration-300">
                  <CardHeader>
                    <div className="bg-primary/10 text-primary w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4">
                      <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                    {featureVisuals[f.title]}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-semibold text-primary text-sm sm:text-base">Pricing</p>
              <h2 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">The right plan for your needs</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                {pricing.festiveDiscount > 0 ? (
                  <span className="flex items-center justify-center gap-2 text-primary font-semibold">
                    <PartyPopper className="h-4 w-4 sm:h-5 sm:w-5" /> 
                    {pricing.festiveName}: Extra {pricing.festiveDiscount}% Off All Plans!
                  </span>
                ) : 'Choose the plan that’s right for you.'}
              </p>

              <div className="flex items-center justify-center gap-3 mt-8">
                <span className={`text-xs sm:text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${annual ? "bg-primary" : "bg-slate-800"}`}
                >
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${annual ? "translate-x-5 sm:translate-x-6" : "translate-x-0"}`} />
                </button>
                <span className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                  Annual
                  <span className="text-[10px] text-green-500 font-black bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
              {/* Pricing Cards */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl"><Star className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" /> Free</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">For students exploring jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-3xl sm:text-4xl font-bold font-headline">₹0<span className="text-base sm:text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Basic templates</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts</li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={getStartedLink}>Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col relative overflow-hidden">
                {(pricing.festiveDiscount > 0 || annual) && <Badge className="absolute top-2 right-2 bg-green-500 text-[10px]">Sale</Badge>}
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl"><Trophy className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" /> Essentials</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">For active job seekers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-xs text-muted-foreground line-through">₹{pricing.essentials}</span>
                    )}
                    <p className="text-3xl sm:text-4xl font-bold font-headline">₹{calculatePrice(pricing.essentials)}<span className="text-base sm:text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <Link href={pricingLink}>Choose Essentials</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary border-2 relative flex flex-col overflow-hidden">
                <Badge className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[10px]" variant="secondary">Popular</Badge>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl"><Crown className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5" /> Pro</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">For top-tier professionals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-xs text-muted-foreground line-through">₹{pricing.pro}</span>
                    )}
                    <p className="text-3xl sm:text-4xl font-bold font-headline">₹{calculatePrice(pricing.pro)}<span className="text-base sm:text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <Link href={pricingLink}>Choose Pro</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl"><Diamond className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" /> Recruiter</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">For hiring teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-xs text-muted-foreground line-through">₹{pricing.recruiter}</span>
                    )}
                    <p className="text-3xl sm:text-4xl font-bold font-headline">₹{calculatePrice(pricing.recruiter)}<span className="text-base sm:text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Team Management</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics</li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={pricingLink}>Choose Recruiter</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <p className="text-center text-[10px] text-muted-foreground mt-12 font-medium uppercase tracking-widest">
              🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="font-semibold text-primary text-sm sm:text-base">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">Common Questions</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                Everything you need to know about CareerCraft AI.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-muted-foreground/20">
                    <AccordionTrigger className="text-left font-semibold py-6 hover:no-underline">
                      <div className="flex items-center gap-3 text-sm sm:text-base">
                        <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-[#0d0f14]">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Top Row — Brand + PH Badge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.jpg" alt="CareerCraft AI" className="w-7 h-7 rounded-md" />
                <span className="font-bold text-white text-lg font-headline">CareerCraft AI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                AI-powered resume builder for students and professionals in India.
              </p>
            </div>

            {/* Product Hunt Badge */}
            <a href="https://www.producthunt.com/posts/careercraft-ai" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=careercraft-ai&theme=light"
                alt="CareerCraft AI - Featured on Product Hunt"
                width="200" height="44"
                className="w-[200px] h-[44px] sm:w-[250px] sm:h-[54px]"
              />
            </a>
          </div>

          {/* Middle Row — Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Product</p>
              <ul className="space-y-2">
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">For You</p>
              <ul className="space-y-2">
                {[
                  { label: "For Students", href: "/signup" },
                  { label: "For Professionals", href: "/signup" },
                  { label: "For Recruiters", href: "/signup" },
                  { label: "Job Matcher", href: "/job-matcher" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
              <ul className="space-y-2">
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Cancellation & Refund", href: "/cancellation" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Support</p>
              <ul className="space-y-2">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "Help Center", href: "/support" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
              {/* Razorpay trust badge */}
              <div className="mt-4 flex items-center gap-1.5 text-gray-600">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span className="text-xs">Secured by Razorpay</span>
              </div>
            </div>
          </div>

          {/* Bottom Row — Copyright + Creator */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} CareerCraft AI. All rights reserved.</p>

            {/* Built by */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">Built by <span className="text-gray-400 font-medium">Hitarth Chauhan</span></span>
              <div className="flex items-center gap-1">
                {[
                  {
                    label: "GitHub",
                    href: "https://github.com/Hit246",
                    icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12c0-5.523-4.477-10-10-10z"/></svg>,
                  },
                  {
                    label: "LinkedIn",
                    href: "https://linkedin.com/in/chauhanhitarth6",
                    icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                  },
                  {
                    label: "Portfolio",
                    href: "https://hitarth-chauhan.vercel.app",
                    icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2c1.29 0 2.56.27 3.72.76L13 7H9.5L8 9.5l2 4-1.5 3H6.28A8 8 0 0 1 4 12c0-4.41 3.59-8 8-8zm0 16a8 8 0 0 1-5.47-2.15L8 15.5l1.5-3-2-4L9.5 6H13l3-2.63A8 8 0 0 1 12 20z"/></svg>,
                  },
                ].map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gray-800 transition-colors"
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