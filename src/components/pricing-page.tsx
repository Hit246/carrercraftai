
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast" 
import { createPaymentLink } from "@/lib/razorpay"
import { db } from "@/lib/firebase";
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
    if (!user) { router.push("/login"); return; }
    const displayName = userData?.displayName || user.displayName;
    const phoneNumber = userData?.phoneNumber;
    if (!displayName || !phoneNumber) {
        toast({ title: "Profile Incomplete", description: "Save your name and phone number in profile first.", variant: "destructive", action: <Button onClick={() => router.push('/profile')}>Go to Profile</Button> });
        return;
    }
    setIsProcessing(selectedPlan);
    try {
        await updateDoc(doc(db, 'users', user.uid), { previousPlan: plan, plan: 'pending', requestedPlan: selectedPlan });
        const res = await createPaymentLink(planDetails[selectedPlan].amount, selectedPlan, { name: displayName, email: user.email!, contact: phoneNumber }, user.uid);
        if (res.success && res.url) { window.location.href = res.url; }
        else { throw new Error(res.error || "Gateway error"); }
    } catch (err: any) {
        toast({ title: "Payment Error", description: err.message, variant: "destructive" });
        setIsProcessing(null);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold font-headline lg:text-5xl">Elevate Your Career</h1>
        <p className="mt-4 text-muted-foreground text-lg">Choose the right plan to unlock powerful AI career tools.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
        <Card className="flex flex-col">
          <CardHeader><CardTitle className="flex gap-2"><Star className="text-yellow-500" /> Free</CardTitle><CardDescription>Explore our AI features.</CardDescription></CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-4xl font-bold font-headline">₹0<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 5 AI credits/mo</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Basic templates</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 2 Resume drafts</li>
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4"><Button variant="outline" className="w-full" disabled>{plan === 'free' ? 'Current' : 'Select'}</Button></CardFooter>
        </Card>

        <Card className="flex flex-col border-primary/20">
          <CardHeader><CardTitle className="flex gap-2"><Trophy className="text-gray-400" /> Essentials</CardTitle><CardDescription>For active job seekers.</CardDescription></CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-4xl font-bold font-headline">₹199<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 50 AI credits</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Cover letter generator</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 10 Resume drafts</li>
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4"><Button className="w-full" onClick={() => handlePayment('essentials')} disabled={!!isProcessing || plan !== 'free'}>{isProcessing === 'essentials' ? <Loader2 className="animate-spin" /> : (plan === 'essentials' ? 'Current' : 'Upgrade')}</Button></CardFooter>
        </Card>

        <Card className="flex flex-col border-primary shadow-xl relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best Value</Badge>
          <CardHeader><CardTitle className="flex gap-2"><Crown className="text-amber-500" /> Pro</CardTitle><CardDescription>Unlimited power for pros.</CardDescription></CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-4xl font-bold font-headline">₹399<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited AI analysis</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> ATS Optimizer access</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Skill gap analysis</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited resumes</li>
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4"><Button className="w-full" onClick={() => handlePayment('pro')} disabled={!!isProcessing || plan === 'recruiter' || plan === 'pro'}>{isProcessing === 'pro' ? <Loader2 className="animate-spin" /> : (plan === 'pro' ? 'Current' : 'Go Pro')}</Button></CardFooter>
        </Card>

        <Card className="flex flex-col border-blue-500/20">
          <CardHeader><CardTitle className="flex gap-2"><Diamond className="text-blue-500" /> Recruiter</CardTitle><CardDescription>For hiring managers.</CardDescription></CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-4xl font-bold font-headline">₹999<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> AI Candidate Matcher</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Shortlist Management</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Hiring Analytics Dashboard</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Bulk Resume Processing</li>
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4"><Button className="w-full" onClick={() => handlePayment('recruiter')} disabled={!!isProcessing || plan === 'recruiter'}>{isProcessing === 'recruiter' ? <Loader2 className="animate-spin" /> : (plan === 'recruiter' ? 'Current' : 'Get Recruiter')}</Button></CardFooter>
        </Card>
      </div>
    </div>
  )
}
