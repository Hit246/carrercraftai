
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | CareerCraft AI",
  description:
    "Read the Terms of Service for using CareerCraft AI, including account usage, subscriptions, and governing law.",
  alternates: {
    canonical: "https://carrercraftai.vercel.app/terms",
  },
};

export default function TermsOfServicePage() {
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-stone dark:prose-invert max-w-none">
            <p>
              Welcome to CareerCraft AI! These terms and conditions outline the rules and regulations for the use of CareerCraft AI's Website, located at careercraftai.vercel.app.
            </p>

            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use CareerCraft AI if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <section>
              <h2 className="text-xl font-semibold font-headline">1. License to Use</h2>
              <p>
                Unless otherwise stated, CareerCraft AI and/or its licensors own the intellectual property rights for all material on CareerCraft AI. All intellectual property rights are reserved. You may access this from CareerCraft AI for your own personal use subjected to restrictions set in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Republish material from CareerCraft AI</li>
                <li>Sell, rent or sub-license material from CareerCraft AI</li>
                <li>Reproduce, duplicate or copy material from CareerCraft AI</li>
                <li>Redistribute content from CareerCraft AI</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">2. User Accounts</h2>
              <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">3. Subscription and AI Credits</h2>
              <p>
                Our service is offered on a tiered subscription basis ("Free", "Essentials", "Pro", "Recruiter"). AI credits are provided based on your subscription plan and are used for accessing AI-powered features. Unused credits in a given month do not roll over.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">4. Limitation of Liability</h2>
              <p>
                In no event shall CareerCraft AI, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. CareerCraft AI, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">5. Governing Law</h2>
              <p>These Terms will be governed by and interpreted in accordance with the laws of the State of Gujarat, India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Gujarat for the resolution of any disputes.</p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
