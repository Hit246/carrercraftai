import { blogPosts } from "@/data/blog-posts";
import Link from "next/link";
import { HomeHeader } from "@/components/home-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, BookOpen, MoveRight } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata = {
  title: "Career Resources & Resume Advice | CareerCraft AI",
  description: "Expert resume tips, ATS guides, and career growth strategies tailored for the Indian job market.",
};

export default function BlogPage() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <HomeHeader />
        
        <main className="flex-1 pb-24">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden border-b border-border/40">
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
            <div className="container mx-auto px-4 text-center space-y-6">
              <Badge variant="outline" className="py-1.5 px-4 bg-primary/5 border-primary/20 text-primary font-bold uppercase tracking-widest text-[10px]">
                <BookOpen className="w-3.5 h-3.5 mr-2" /> Expert Career Insights
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
                Career <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Resources</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Stay ahead of the curve with our latest guides on ATS optimization, technical interviews, and modern resume trends.
              </p>
            </div>
          </section>

          {/* Post Grid */}
          <section className="container mx-auto px-4 pt-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full flex flex-col border-border/40 card-hover bg-card/50 overflow-hidden transition-all duration-300">
                    <CardHeader className="space-y-4 pb-0">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-tighter h-5">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-4">
                      <CardDescription className="text-base line-clamp-3 leading-relaxed mb-8">
                        {post.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-auto">
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          Read <MoveRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t py-12 bg-card/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-medium">
            <p>© 2026 CareerCraft AI. Empowerment through Education.</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
