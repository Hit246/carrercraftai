import { blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HomeHeader } from "@/components/home-header";
import { AuthProvider } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft,Sparkles, Calendar, Clock, Share2 } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
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
    alternates: {
      canonical: `https://careercraftai.tech/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Hitarth Chauhan'],
      tags: post.tags,
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": "Hitarth Chauhan",
      "url": "https://github.com/Hit246"
    },
    "datePublished": post.date,
    "image": "https://careercraftai.tech/og-image.webp",
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HomeHeader />
        
        <main className="flex-1 pb-32">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <Button variant="ghost" asChild className="mb-12 hover:bg-muted/50 rounded-xl px-4 font-bold text-muted-foreground hover:text-primary transition-colors">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Resources Hub
                </Link>
              </Button>

              <article className="space-y-12">
                <header className="space-y-8">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight leading-[1.1]">
                    {post.title}
                  </h1>

                  <div className="flex items-center justify-between border-y border-border/40 py-6">
                    <div className="flex items-center gap-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {post.readTime} Read
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl border border-border/40 h-10 w-10"><FaTwitter className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" className="rounded-xl border border-border/40 h-10 w-10"><FaLinkedin className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" className="rounded-xl border border-border/40 h-10 w-10"><Share2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </header>

                <div 
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <footer className="mt-20 pt-12 border-t border-border/40">
                  <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center space-y-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 rotate-3">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold font-headline">Ready to take the next step?</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Put these insights into practice. Build your ATS-optimized resume with CareerCraft AI today.
                      </p>
                    </div>
                    <Button size="lg" className="btn-gradient px-10 h-12 rounded-xl font-bold shadow-xl shadow-primary/20" asChild>
                      <Link href="/signup">Start Building Free</Link>
                    </Button>
                  </div>
                </footer>
              </article>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
