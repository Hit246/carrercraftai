'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles, Check, Crown, Target, Star, Trophy, Diamond, Key, PartyPopper, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PricingSettings {
  essentials: number;
  pro: number;
  recruiter: number;
  festiveDiscount: number;
  festiveName: string;
}

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
        <section className="relative py-24 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full text-primary border-primary/50">
              <Sparkles className="w-4 h-4 mr-2 -ml-1" />
              Powered by Generative AI
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl lg:text-7xl">
              Craft Your Future with AI
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:xl mb-6">
              Build the perfect resume, get AI-driven feedback, and find jobs that truly match your skills. CareerCraft AI is your ultimate partner in professional growth.
            </p>

            {/* Product Hunt Pill Badge */}
            <a
              href="https://www.producthunt.com/posts/careercraft-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-sm font-medium hover:scale-105 transition-transform mb-10"
            >
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#DA552F"/>
                <path d="M22.7 20c1.7-.6 2.8-2.2 2.8-4 0-2.4-2-4.3-4.5-4.3H14v16.6h3.3v-7.6h2.8l4.8 7.6H28L22.7 20zm-5.4-5.2h3.5c.7 0 1.3.5 1.3 1.2s-.6 1.2-1.3 1.2h-3.5v-2.4z" fill="white"/>
              </svg>
              Featured on Product Hunt
            </a>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href={getStartedLink}>Create My Resume</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 md:py-32 bg-card border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-semibold text-primary">Our Features</p>
              <h2 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">Everything you need to level up your career</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                From creation to application, our intelligent tools support you at every step.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <CardTitle>Intuitive Resume Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create professional, version-controlled resumes with our intuitive builder and live preview, designed to impress any recruiter.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <CardTitle>AI Resume Analyzer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get instant, actionable feedback to improve your resume's impact, clarity, and keyword optimization.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <CardTitle>ATS Optimizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Compare your resume against a job description to identify missing keywords and get a match score to beat the bots.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <CardTitle>Smart Job Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Discover job opportunities that perfectly align with your unique skills, experience, and career aspirations.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <CardTitle>Cover Letter Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Instantly generate a personalized cover letter for any job description, based on the contents of your resume.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle>Candidate Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">For recruiters: efficiently find the best candidates for your roles from a diverse pool of qualified resumes.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-semibold text-primary">Pricing</p>
              <h2 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">The right plan for your needs</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                {pricing.festiveDiscount > 0 ? (
                  <span className="flex items-center justify-center gap-2 text-primary font-semibold">
                    <PartyPopper className="h-5 w-5" /> 
                    {pricing.festiveName}: Extra {pricing.festiveDiscount}% Off All Plans!
                  </span>
                ) : 'Choose the plan that’s right for you and take the next step in your career.'}
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${annual ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                  Annual
                  <span className="ml-2 text-[10px] text-green-500 font-black bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Star className="text-yellow-500" /> Free</CardTitle>
                  <CardDescription>For students & freshers exploring jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-4xl font-bold font-headline">₹0<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Basic templates</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link href={getStartedLink}>Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col relative overflow-hidden">
                {(pricing.festiveDiscount > 0 || annual) && <Badge className="absolute top-2 right-2 bg-green-500">Sale</Badge>}
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Trophy className="text-gray-400" /> Essentials</CardTitle>
                  <CardDescription>For active job seekers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-sm text-muted-foreground line-through">₹{pricing.essentials}</span>
                    )}
                    <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.essentials)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <Button asChild className="w-full mt-2">
                    <Link href={pricingLink}>Choose Essentials</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary border-2 relative flex flex-col overflow-hidden">
                <Badge className="absolute top-4 right-4" variant="secondary">Most Popular</Badge>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-amber-500" /> Pro</CardTitle>
                  <CardDescription>For professionals aiming for top jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-sm text-muted-foreground line-through">₹{pricing.pro}</span>
                    )}
                    <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.pro)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <Button asChild className="w-full mt-2">
                    <Link href={pricingLink}>Choose Pro</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Diamond className="text-blue-500" /> Recruiter</CardTitle>
                  <CardDescription>For recruiters & HR teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    {(pricing.festiveDiscount > 0 || annual) && (
                      <span className="text-sm text-muted-foreground line-through">₹{pricing.recruiter}</span>
                    )}
                    <p className="text-4xl font-bold font-headline">₹{calculatePrice(pricing.recruiter)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                    {annual && <p className="text-[10px] text-muted-foreground mt-1">Billed annually</p>}
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Team Management</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <Button asChild variant="secondary" className="w-full mt-2">
                    <Link href={pricingLink}>Choose Recruiter</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Trust signals */}
            <p className="text-center text-xs text-muted-foreground mt-12 font-medium uppercase tracking-widest">
              🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-[#0d0f14] mt-20">
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
            <a 
              href="https://www.producthunt.com/posts/careercraft-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-orange-800/50 bg-orange-950/20 hover:bg-orange-950/40 transition-colors group"
            >
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#DA552F"/>
                <path d="M22.7 20c1.7-.6 2.8-2.2 2.8-4 0-2.4-2-4.3-4.5-4.3H14v16.6h3.3v-7.6h2.8l4.8 7.6H28L22.7 20zm-5.4-5.2h3.5c.7 0 1.3.5 1.3 1.2s-.6 1.2-1.3 1.2h-3.5v-2.4z" fill="white"/>
              </svg>
              <div>
                <p className="text-[10px] text-orange-400 uppercase tracking-widest font-medium">Find us on</p>
                <p className="text-white font-bold text-sm group-hover:text-orange-300 transition-colors">Product Hunt</p>
              </div>
            </a>
          </div>

          {/* Middle Row — Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Product</p>
              <ul className="space-y-2">
                {[
                  { label: "Features", href: "/#features" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Resume Builder", href: "/resume-builder" },
                  { label: "ATS Optimizer", href: "/ats-optimizer" },
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
