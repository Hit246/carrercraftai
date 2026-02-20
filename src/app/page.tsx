'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles, Check, Crown, Target, Star, Trophy, Diamond, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';
import React from 'react';

function HomePageContent() {
  const { user, loading } = useAuth();

  const getStartedLink = user ? '/dashboard' : '/signup';
  const pricingLink = user ? '/pricing' : '/signup';

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <HomeHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          // JSON-LD for better Google understanding of your brand & product
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CareerCraft AI",
              url: "https://carrercraftai.vercel.app",
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
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Build the perfect resume, get AI-driven feedback, and find jobs that truly match your skills. CareerCraft AI is your ultimate partner in professional growth.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
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
                Choose the plan that’s right for you and take the next step in your career.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Star className="text-yellow-500" /> Free</CardTitle>
                  <CardDescription>For students & freshers exploring jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-4xl font-bold font-headline">₹0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Basic templates</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Key className="w-4 h-4" />
                    <span>Good for beginners.</span>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link href={getStartedLink}>Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Trophy className="text-gray-400" /> Essentials</CardTitle>
                  <CardDescription>For active job seekers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-4xl font-bold font-headline">₹199<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Cover letter generator</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Portfolio showcase</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Key className="w-4 h-4" />
                    <span>Great for people applying regularly.</span>
                  </div>
                  <Button asChild className="w-full mt-2">
                    <Link href={pricingLink}>Choose Essentials</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary border-2 relative flex flex-col">
                <Badge className="absolute top-4 right-4" variant="secondary">Most Popular</Badge>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-amber-500" /> Pro</CardTitle>
                  <CardDescription>For professionals aiming for top jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-4xl font-bold font-headline">₹399<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Skill gap analysis</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Resume performance analytics</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Priority support</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Key className="w-4 h-4" />
                    <span>Perfect for experienced professionals.</span>
                  </div>
                  <Button asChild className="w-full mt-2">
                    <Link href={pricingLink}>Choose Pro</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Diamond className="text-blue-500" /> Recruiter</CardTitle>
                  <CardDescription>For recruiters & HR teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-4xl font-bold font-headline">₹999<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking & Summaries</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Candidate Management Dashboard</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Team Management</li>
                    <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics dashboard</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Key className="w-4 h-4" />
                    <span>Best for freelance recruiters.</span>
                  </div>
                  <Button asChild variant="secondary" className="w-full mt-2">
                    <Link href={pricingLink}>Contact Sales</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} CareerCraft AI. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            <Link href="/cancellation" className="underline hover:text-foreground">Cancellation & Refund Policy</Link>
            <Link href="/contact" className="underline hover:text-foreground">Contact Us</Link>
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
