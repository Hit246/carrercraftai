import { blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HomeHeader } from "@/components/home-header";
import { AuthProvider } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | CareerCraft AI Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return notFound();

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <HomeHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <Button variant="ghost" asChild className="mb-8 -ml-4">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </Button>

            <article className="max-w-3xl mx-auto">
              <div className="space-y-6 mb-12">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                  {post.title}
                </h1>
                <div className="flex items-center justify-between border-y py-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div 
                className="prose prose-stone dark:prose-invert max-w-none prose-h2:font-headline prose-h3:font-headline prose-h2:text-2xl prose-h3:text-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                <h3 className="text-2xl font-bold font-headline mb-4">Ready to land your dream job?</h3>
                <p className="text-muted-foreground mb-6">
                  Put these tips into practice with our AI-powered resume tools.
                </p>
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </article>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
