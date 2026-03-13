import { blogPosts } from "@/data/blog-posts";
import Link from "next/link";
import { HomeHeader } from "@/components/home-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata = {
  title: "Career Tips & Resume Advice | CareerCraft AI Blog",
  description: "Free resume tips, ATS guides, and career advice for Indian job seekers and freshers.",
};

export default function BlogPage() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <HomeHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl mb-16">
              <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl mb-4">
                Career Resources
              </h1>
              <p className="text-xl text-muted-foreground">
                Expert resume tips, ATS optimization guides, and career growth strategies tailored for the Indian job market.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full border-2 border-transparent hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl">
                    <CardHeader className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-2">
                        {post.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Read More <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
        {/* Footer will be automatically included from layout or home-header logic if configured, 
            but for consistency we use the standard home page footer structure */}
      </div>
    </AuthProvider>
  );
}
