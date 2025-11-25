

'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay"
import { Check, Crown, Users, Target, Star, Trophy, Diamond, Key, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import useRazorpay from "react-razorpay";

type Plan = 'essentials' | 'pro' | 'recruiter';

const planDetails = {
    essentials: { name: "Essentials Plan", amount: 199 },
    pro: { name: "Pro Plan", amount: 399 },
    recruiter: { name: "Recruiter Plan", amount: 999 },
};

export function PricingPage() {
  const { user, plan } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [Razorpay, isLoaded] = useRazorpay();
  const [isProcessing, setIsProcessing] = useState<Plan | null>(null);
  
  const handlePayment = async (selectedPlan: Plan) => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        toast({ title: 'Configuration Error', description: 'Razorpay is not configured. Please contact support.', variant: 'destructive' });
        return;
    }
    if (!user || !isLoaded) {
      if (!user) router.push('/login');
      else toast({ title: 'Error', description: 'Payment gateway is not ready.', variant: 'destructive' });
      return;
    }
    
    setIsProcessing(selectedPlan);
    const planInfo = planDetails[selectedPlan];

    try {
      const orderResponse = await createRazorpayOrder(planInfo.amount, 'INR');

      if (!orderResponse.success || !orderResponse.order) {
        throw new Error(orderResponse.error || 'Failed to create payment order.');
      }
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount.toString(),
        currency: orderResponse.order.currency,
        name: "CareerCraft AI",
        description: `Upgrade to ${planInfo.name}`,
        order_id: orderResponse.order.id,
        handler: async function (response: any) {
            try {
                const verificationResponse = await verifyRazorpayPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature,
                    user.uid,
                    selectedPlan
                );

                if (verificationResponse.success) {
                    toast({ title: 'Payment Successful!', description: 'Your plan has been upgraded.' });
                    router.push('/dashboard');
                } else {
                    throw new Error(verificationResponse.error || 'Payment verification failed.');
                }
            } catch (verificationError: any) {
                toast({
                    title: "Payment Verification Failed",
                    description: verificationError.message || "Something went wrong during verification.",
                    variant: "destructive",
                });
            }
        },
        prefill: {
            name: user.displayName || "",
            email: user.email || "",
            contact: user.phoneNumber || "",
        },
        theme: {
            color: "#6d28d9"
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
          toast({
            title: "Payment Failed",
            description: response.error.description || "Something went wrong.",
            variant: "destructive",
          });
      });

      rzp.open();

    } catch (error: any) {
        console.error("Handle Payment Error:", error);
        toast({ title: "Payment Error", description: error.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
        setIsProcessing(null);
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
          Unlock Your Full Potential
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that’s right for you and take the next step in your career. Get access to powerful AI tools that give you a competitive edge.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Star className="text-yellow-500" /> Free – Starter</CardTitle>
                <CardDescription>For students & freshers exploring jobs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <p className="text-4xl font-bold font-headline">₹0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-2 text-left text-sm">
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits per month</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Basic templates</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resume drafts</li>
                </ul>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-4 h-4"/>
                  <span>Good for beginners.</span>
                </div>
                <Button asChild variant="outline" className="w-full mt-2" disabled={plan === 'free'}>
                   {plan === 'free' ? 'Your Current Plan' : 'Get Started'}
                </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Trophy className="text-gray-400" /> Essentials</CardTitle>
                <CardDescription>For active job seekers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <p className="text-4xl font-bold font-headline">₹199<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 text-left text-sm">
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> ATS keyword suggestions</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Cover letter generator</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Portfolio showcase</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
                </ul>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-4 h-4"/>
                  <span>Great for people applying regularly.</span>
                </div>
                <Button className="w-full mt-2" onClick={() => handlePayment('essentials')} disabled={isProcessing !== null || plan === 'essentials' || plan === 'pro' || plan === 'recruiter'}>
                  {isProcessing === 'essentials' ? <Loader2 className="animate-spin" /> : (plan === 'essentials' ? 'Your Current Plan' : 'Upgrade')}
                </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary border-2 relative flex flex-col">
               <Badge className="absolute top-4 right-4" variant="secondary">Most Popular</Badge>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-amber-500" /> Pro – Advanced</CardTitle>
                <CardDescription>For professionals aiming for top jobs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <p className="text-4xl font-bold font-headline">₹399<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 text-left text-sm">
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI generation</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Advanced ATS optimization</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Skill gap analysis</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Resume performance analytics</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Priority support</li>
                </ul>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-4 h-4"/>
                  <span>Perfect for experienced professionals.</span>
                </div>
                {plan === 'pro' ? (
                  <Button className="w-full mt-2" disabled>Your Current Plan</Button>
                ) : (
                  <Button className="w-full mt-2" onClick={() => handlePayment('pro')} disabled={isProcessing !== null || plan === 'pro' || plan === 'recruiter'}>
                    {isProcessing === 'pro' ? <Loader2 className="animate-spin" /> : (plan === 'recruiter' ? 'Included in Recruiter' : 'Upgrade to Pro')}
                  </Button>
                )}
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Diamond className="text-blue-500" /> Recruiter Plan</CardTitle>
                <CardDescription>For recruiters & HR teams.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <p className="text-4xl font-bold font-headline">₹999<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 text-left text-sm">
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking & Summaries</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Candidate Management Dashboard</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Team Management</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 25 job postings / month</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter analytics dashboard</li>
                </ul>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-4 h-4"/>
                  <span>Best for freelance recruiters.</span>
                </div>
                 {plan === 'recruiter' ? (
                  <Button className="w-full mt-2" disabled>Your Current Plan</Button>
                ) : (
                  <Button className="w-full mt-2" variant="secondary" onClick={() => handlePayment('recruiter')} disabled={isProcessing !== null || plan === 'recruiter'}>
                       {isProcessing === 'recruiter' ? <Loader2 className="animate-spin" /> : 'Upgrade to Recruiter'}
                  </Button>
                )}
            </CardFooter>
          </Card>
      </div>
    </div>
  )
}
