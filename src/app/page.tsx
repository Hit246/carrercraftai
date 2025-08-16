import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Briefcase, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthProvider } from '@/hooks/use-auth';
import { HomeHeader } from '@/components/home-header';


function HomePageContent() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <HomeHeader />
      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40">
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
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6"/>
                    </div>
                  <CardTitle>Resume Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create professional resumes with our intuitive builder and customizable templates, designed to impress any recruiter.</p>
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
      </main>
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} CareerCraft AI. All rights reserved.</p>
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
