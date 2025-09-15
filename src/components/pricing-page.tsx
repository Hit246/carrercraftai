'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Check, Crown, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PaymentDialog } from "./payment-dialog"

type PlanToUpgrade = 'pro' | 'recruiter' | null;

export function PricingPage() {
  const { user, plan, requestProUpgrade, requestRecruiterUpgrade } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [planToUpgrade, setPlanToUpgrade] = useState<PlanToUpgrade>(null);

  const handleUpgrade = async (selectedPlan: 'pro' | 'recruiter') => {
    if (!user) {
        router.push('/login');
        return;
    }
    setPlanToUpgrade(selectedPlan);
  }

  const onPaymentConfirm = async (paymentProofURL: string) => {
    if (!planToUpgrade) return;

    try {
      if (planToUpgrade === 'pro') {
        await requestProUpgrade(paymentProofURL);
      } else {
        await requestRecruiterUpgrade(paymentProofURL);
      }
      toast({
          title: "Request Submitted!",
          description: "Your upgrade request has been submitted for review. An admin will verify it shortly.",
      });
      router.push('/order-status');
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit upgrade request.", variant: "destructive" });
    } finally {
      setPlanToUpgrade(null);
    }
  }

  return (
    <>
    <PaymentDialog 
      isOpen={!!planToUpgrade}
      onClose={() => setPlanToUpgrade(null)}
      onConfirm={onPaymentConfirm}
      plan={planToUpgrade}
    />
    <div className="flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
          Unlock Your Full Potential
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that’s right for you and take the next step in your career. Get access to powerful AI tools that give you a competitive edge.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>For getting started and building a foundational resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold font-headline">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Intuitive Resume Builder</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Professional Templates</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> 3 AI Credits</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Crown className="h-5 w-5" /> Unlimited AI Features</li>
               <li className="flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5" /> AI Candidate Matcher</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={plan === 'free'}>
              {plan === 'free' ? 'Your Current Plan' : 'Get Started'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary border-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent"></div>
            <div className="absolute -top-12 -right-12 bg-primary/20 text-primary p-4 rounded-full flex items-center justify-center transform rotate-45">
                 <Crown className="w-16 h-16" />
            </div>
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>For professionals who want to stand out and land their dream job.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold font-headline">$10<span className="text-lg font-normal text-muted-foreground">/month</span></p>
             <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Everything in Free, plus:</li>
              <li className="flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-500" /> Unlimited AI Resume Analyzer</li>
              <li className="flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-500" /> Unlimited AI Job Matcher</li>
              <li className="flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-500" /> Unlimited AI Cover Letter Generator</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Priority Support</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5" /> AI Candidate Matcher</li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === 'pro' ? (
                <Button className="w-full" disabled>
                    Your Current Plan
                </Button>
            ) : (
                <Button className="w-full" onClick={() => handleUpgrade('pro')} disabled={plan === 'recruiter' || plan === 'pending'}>
                    {plan === 'recruiter' ? 'Included in Recruiter' : (plan === 'pending' ? 'Request Pending' : 'Upgrade to Pro')}
                </Button>
            )}
          </CardFooter>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Recruiter Plan</CardTitle>
            <CardDescription>For hiring managers and recruitment agencies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold font-headline">$49<span className="text-lg font-normal text-muted-foreground">/month</span></p>
             <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Everything in Pro, plus:</li>
              <li className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5 text-blue-500" /> Unlimited AI Candidate Matcher</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Team Management Tools</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Dedicated Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === 'recruiter' ? (
                 <Button className="w-full" disabled>
                    Your Current Plan
                </Button>
            ) : (
                <Button className="w-full" variant="secondary" onClick={() => handleUpgrade('recruiter')} disabled={plan === 'pending'}>
                     {plan === 'pending' ? 'Request Pending' : 'Upgrade to Recruiter'}
                </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  )
}
