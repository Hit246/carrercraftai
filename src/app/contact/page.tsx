
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, LifeBuoy } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-headline text-foreground">
              CareerCraft AI
            </h1>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Back to App</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
            <CardDescription>We'd love to hear from you. Here's how you can reach us.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-1 p-6 border rounded-lg text-center">
                    <Mail className="h-10 w-10 mx-auto text-primary mb-4"/>
                    <h3 className="text-lg font-semibold">General Inquiries</h3>
                    <p className="text-muted-foreground text-sm mb-4">For general questions, partnerships, or media inquiries.</p>
                    <a href="mailto:hitarth0236@gmail.com" className="text-primary font-medium hover:underline">hitarth0236@gmail.com</a>
                </div>
                 <div className="flex-1 p-6 border rounded-lg text-center">
                    <LifeBuoy className="h-10 w-10 mx-auto text-primary mb-4"/>
                    <h3 className="text-lg font-semibold">Technical & Billing Support</h3>
                    <p className="text-muted-foreground text-sm mb-4">For the fastest support, please use our dedicated support page.</p>
                    <Button asChild>
                      <Link href="/support">Go to Support Page</Link>
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
