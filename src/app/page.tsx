import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              CareerCraft AI
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Resume Builder</Link>
            <Link href="/candidate-matcher" className="text-muted-foreground transition-colors hover:text-foreground">For Recruiters</Link>
          </nav>
          <div className="flex items-center gap-2">
             <Button variant="ghost" asChild>
                <Link href="/dashboard">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl">
              Craft Your Future with AI-Powered Career Tools
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Build the perfect resume, get AI-driven feedback, and find jobs that match your skills. CareerCraft AI is your partner in professional growth.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Create My Resume</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 md:py-32 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="font-semibold text-primary">Our Features</p>
              <h3 className="mt-2 text-3xl font-bold font-headline sm:text-4xl">Everything you need to level up your career</h3>
              <p className="mt-4 text-muted-foreground">
                From creation to application, our intelligent tools support you at every step.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary"/>
                    <span>Resume Builder</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Create professional resumes with our intuitive builder and customizable templates.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary"/>
                    <span>AI Resume Analyzer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Get instant, actionable feedback to improve your resume's impact and clarity.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-primary"/>
                    <span>Smart Job Matching</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Discover job opportunities that perfectly align with your skills and experience.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary"/>
                    <span>Candidate Matching</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">For recruiters: find the best candidates for your roles from a pool of resumes.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} CareerCraft AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
