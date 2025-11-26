

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "./ui/badge"

import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createPaymentLink } from "@/lib/razorpay"

import { Check, Crown, Trophy, Diamond, Key, Loader2, Star } from "lucide-react"

type Plan = "free" | "essentials" | "pro" | "recruiter"

const planDetails: Record<Exclude<Plan,'free'>, { name: string; amount: number }> = {
  essentials: { name: "Essentials Plan", amount: 199 },
  pro: { name: "Pro Plan", amount: 399 },
  recruiter: { name: "Recruiter Plan", amount: 999 },
};

export function PricingPage() {
  const { user, plan, userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState<Exclude<Plan,'free'> | null>(null)

  const handlePayment = async (selectedPlan: Exclude<Plan, "free">) => {
    if (!user || !user.email) {
      router.replace("/login");
      return;
    }

    const displayName = userData?.displayName || user.displayName;
    const phoneNumber = userData?.phoneNumber;

    if (!displayName || !phoneNumber) {
        toast({
            title: "Profile Incomplete",
            description: "Please save your name and phone number in your profile before making a payment.",
            variant: "destructive",
            action: <Button variant="secondary" onClick={() => router.push('/profile')}>Go to Profile</Button>
        });
        return;
    }
  
    setIsProcessing(selectedPlan);
    const planInfo = planDetails[selectedPlan];
  
    try {
      // Pass customer information to the payment link
      const res = await createPaymentLink(
        planInfo.amount, 
        selectedPlan,
        {
          name: displayName,
          email: user.email,
          contact: phoneNumber,
        },
        user.uid
      );
  
      if (!res.success) {
        toast({ 
          title: "Payment Error", 
          description: res.error ?? "Unknown error occurred while creating payment link.", 
          variant: "destructive" 
        });
        setIsProcessing(null);
        return;
      }
  
      if (!res.url) {
        toast({
          title: "Gateway Error",
          description: "Payment link was created but the URL is missing.",
          variant: "destructive",
        });
        setIsProcessing(null);
        return;
      }
  
      // Redirect to Razorpay payment page
      window.location.href = res.url;
  
    } catch (err) {
      console.error("Payment handler error:", err);
      toast({
        title: "Critical Error",
        description: "The payment flow failed unexpectedly. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
          Unlock Your Full Potential
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that’s right for you and take the next step in your career. Get access to powerful AI tools
          that give you a competitive edge.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
        {/* Free Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Star className="text-yellow-500" /> Free – Starter
            </CardTitle>
            <CardDescription>For students & freshers exploring jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-4xl font-bold font-headline">
              ₹0<span className="text-lg font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Basic templates
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Key className="w-4 h-4" />
              <span>Good for beginners.</span>
            </div>
            <Button asChild variant="outline" className="w-full mt-2" disabled={plan === "free"}>
              {plan === "free" ? "Your Current Plan" : "Get Started"}
            </Button>
          </CardFooter>
        </Card>

        {/* Essentials */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Trophy className="text-gray-400" /> Essentials
            </CardTitle>
            <CardDescription>For active job seekers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-4xl font-bold font-headline">
              ₹199<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Cover letter generator
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Portfolio showcase
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Key className="w-4 h-4" />
              <span>Great for people applying regularly.</span>
            </div>
            <Button
              className="w-full"
              onClick={() => handlePayment("essentials")}
              variant="default"
              disabled={isProcessing !== null || (plan !== "free" && plan !== "pending")}
            >
              {isProcessing === "essentials" ? <Loader2 className="animate-spin"/> : (plan === "essentials" ? "Your Current Plan" : "Upgrade")}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className="border-primary border-2 relative flex flex-col">
          <Badge className="absolute top-4 right-4" variant="secondary">
            Most Popular
          </Badge>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Crown className="text-amber-500" /> Pro – Advanced
            </CardTitle>
            <CardDescription>For professionals aiming for top jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-4xl font-bold font-headline">
              ₹399<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Skill gap analysis
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Resume performance analytics
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Priority support
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Key className="w-4 h-4" />
              <span>Perfect for experienced professionals.</span>
            </div>
            {plan === "pro" ? (
              <Button className="w-full mt-2" disabled>
                Your Current Plan
              </Button>
            ) : (
              <Button
              className="w-full mt-2"
              onClick={() => handlePayment("pro")}
              variant="default"
              disabled={isProcessing !== null || plan === "recruiter" || plan === "pro"}
              >
                {isProcessing === "pro" ? <Loader2 className="animate-spin"/> : plan === "pro" ? "Your Current Plan" : "Upgrade to Pro"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Recruiter */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Diamond className="text-blue-500" /> Recruiter Plan
            </CardTitle>
            <CardDescription>For recruiters & HR teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-4xl font-bold font-headline">
              ₹999<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking & Summaries
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Candidate Management Dashboard
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Team Management
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 25 job postings / month
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics dashboard
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Key className="w-4 h-4" />
              <span>Best for freelance recruiters.</span>
            </div>
            {plan === "recruiter" ? (
              <Button className="w-full mt-2" disabled>
                Your Current Plan
              </Button>
            ) : (
              <Button
              className="w-full mt-2"
              onClick={() => handlePayment("recruiter")}
              variant="default"
              disabled={isProcessing !== null || plan === "recruiter"}
              >
              {isProcessing === "recruiter" ? <Loader2 className="animate-spin"/> : plan === "recruiter" ? "Your Current Plan" : "Upgrade to Recruiter"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
