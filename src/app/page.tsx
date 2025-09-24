import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles, Check, Crown, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';


function HomePageContent() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <HomeHeader />
      <main className="flex-1">
        <section className="relative py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"/>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full text-primary border-primary/50">
              <Sparkles className="w-4 h-4 mr-2 -ml-1"/>
              Powered by Generative AI
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl lg:text-7xl">
              Craft Your Future with AI
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Build the perfect resume, get AI-driven feedback, and find jobs that truly match your skills. CareerCraft AI is your ultimate partner in professional growth.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">Create My Resume</Link>
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
              <h3 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">Everything you need to level up your career</h3>
              <p className="mt-4 text-muted-foreground text-lg">
                From creation to application, our intelligent tools support you at every step.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6"/>
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
                        <Sparkles className="w-6 h-6"/>
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
                        <Target className="w-6 h-6"/>
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
                        <Briefcase className="w-6 h-6"/>
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
                        <FileText className="w-6 h-6"/>
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
                        <Users className="w-6 h-6"/>
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
                <h3 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">The right plan for your needs</h3>
                <p className="mt-4 text-muted-foreground text-lg">
                    Choose the plan that’s right for you and take the next step in your career.
                </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full mx-auto">
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Free</CardTitle>
                    <CardDescription>For getting started and building a foundational resume.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold font-headline">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Intuitive Resume Builder</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Professional Templates</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> 3 AI Credits</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/signup">Get Started</Link>
                    </Button>
                </CardFooter>
                </Card>

                <Card className="border-primary border-2 relative overflow-hidden">
                     <Badge className="absolute top-4 right-4" variant="secondary">Most Popular</Badge>
                <CardHeader>
                    <CardTitle className="font-headline">Pro</CardTitle>
                    <CardDescription>For professionals who want to stand out and land their dream job.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold font-headline">$10<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Everything in Free, plus:</li>
                    <li className="flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-500" /> Unlimited AI Features</li>
                     <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> AI-Powered ATS Optimizer</li>
                     <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> AI Cover Letter Generator</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Priority Support</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                       <Link href="/signup">Choose Pro</Link>
                    </Button>
                </CardFooter>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recruiter</CardTitle>
                    <CardDescription>For hiring managers and recruitment agencies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold font-headline">$49<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Everything in Pro, plus:</li>
                    <li className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5 text-blue-500" /> AI Candidate Matcher</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Team Management Tools</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="secondary" className="w-full">
                       <Link href="/signup">Contact Sales</Link>
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
          <p className="mt-1">
            <Link href="/cancellation" className="underline hover:text-foreground">Cancellation & Refund Policy</Link>
          </p>
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
