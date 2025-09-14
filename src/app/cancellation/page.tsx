import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CancellationPage() {
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
            <CardTitle className="text-3xl font-headline">Cancellation & Refund Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-stone dark:prose-invert max-w-none">
            <p>
              At CareerCraft AI, we strive to provide excellent service and flexible options for our users. This policy outlines the terms for subscription cancellations and refunds.
            </p>

            <section>
              <h2 className="text-xl font-semibold font-headline">Subscription Cancellation</h2>
              <p>
                You can cancel your "Pro" or "Recruiter" subscription at any time. When you cancel, your subscription will remain active until the end of your current billing period. You will not be charged for the next billing cycle.
              </p>
              <p>
                To cancel your subscription, please navigate to your Profile page and follow the cancellation instructions, or contact our support team for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">Refund Policy</h2>
              <p>
                Due to the nature of our digital services and the immediate access to AI credits and features, we have a limited refund policy.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Full Refunds:</strong> A full refund can be requested on the same day as your initial subscription purchase, provided that you have not used any of the "Pro" or "Recruiter" specific AI features (e.g., Resume Analyzer, Job Matcher, Candidate Matcher).
                </li>
                <li>
                  <strong>Partial Refunds:</strong> We do not offer partial refunds for subscriptions canceled mid-cycle. You will continue to have access to the features until your subscription period ends.
                </li>
                <li>
                  <strong>AI Credits:</strong> AI credits purchased or included in the "Free" plan are non-refundable.
                </li>
              </ul>
              <p>
                All refund requests are subject to review. We reserve the right to decline a refund if we detect abuse of our services or violation of our terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">How to Request a Refund</h2>
              <p>
                To request a refund, please contact our support team via the <Link href="/support" className="underline">Support page</Link>. Please include your account email and the reason for your refund request. Our team will review your request and respond within 3-5 business days.
              </p>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold font-headline">Contact Us</h2>
                <p>If you have any questions about our Cancellation and Refund Policy, please contact us through the support channels available on our website.</p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
