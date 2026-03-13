'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast" 
import { createPaymentLink } from "@/lib/razorpay"
import { db } from "@/lib/firebase";
import { notifyAdminOfUpgradeAction } from "@/lib/actions";

import { Check, Crown, Trophy, Diamond, Loader2, Star, PartyPopper, Tag } from "lucide-react"

type Plan = "free" | "essentials" | "pro" | "recruiter"

interface PricingSettings {
  essentials: number;
  pro: number;
  recruiter: number;
  festiveDiscount: number;
  festiveName: string;
}

export function PricingPage() {
  const { user, plan, userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState<Exclude<Plan,'free'> | null>(null)
  const [settings, setSettings] = useState<PricingSettings>({
    essentials: 199,
    pro: 399,
    recruiter: 999,
    festiveDiscount: 0,
    festiveName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [annual, setAnnual] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, discount: number } | null>(null);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as PricingSettings);
        }
      } catch (e) {
        console.error("Error fetching dynamic pricing:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleApplyPromo = async () => {
    const code = promoCodeInput.toUpperCase().trim();
    if (!code) return;
  
    setIsVerifyingPromo(true);
    try {
      const promoRef = doc(db, 'promoCodes', code); 
      const promoSnap = await getDoc(promoRef);
  
      if (promoSnap.exists()) {
        const data = promoSnap.data();
        setAppliedPromo({ code: data.code, discount: data.discount });
        toast({ 
          title: 'Promo Applied!', 
          description: `${data.discount}% discount has been added.` 
        });
      } else {
        toast({ 
          title: 'Invalid Code', 
          description: 'This promo code does not exist or has expired.', 
          variant: 'destructive' 
        });
        setAppliedPromo(null);
      }
    } catch (e: any) {
      console.error('Promo verify error:', e);
      toast({ 
        title: 'Error', 
        description: e.message || 'Could not verify promo code.', 
        variant: 'destructive' 
      });
      setAppliedPromo(null);
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  const calculateMonthlyPrice = (base: number) => {
    let final = base;
    if (settings.festiveDiscount > 0) {
      final = final * (1 - settings.festiveDiscount / 100);
    }
    if (annual) {
      final = final * 0.8; // 20% Annual Discount
    }
    if (appliedPromo) {
      final = final * (1 - appliedPromo.discount / 100);
    }
    return Math.floor(final);
  };

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
    const monthlyRate = calculateMonthlyPrice(settings[selectedPlan]);
    const finalAmount = annual ? monthlyRate * 12 : monthlyRate;
    
    const basePrice = settings[selectedPlan];
    const festiveDiscount = settings.festiveDiscount;
    const promoDiscount = appliedPromo?.discount || 0;
    const promoCode = appliedPromo?.code || null;

    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 
            previousPlan: plan,
            plan: 'pending',
            requestedPlan: selectedPlan,
            billingCycle: annual ? 'annual' : 'monthly',
            // Temporarily store intended breakdown for history sync if webhook is slow
            tempBasePrice: basePrice,
            tempFestiveDiscount: festiveDiscount,
            tempPromoDiscount: promoDiscount,
            tempPromoCode: promoCode,
        });
        
        await notifyAdminOfUpgradeAction({
          userEmail: user.email,
          plan: `${selectedPlan} (${annual ? 'Annual' : 'Monthly'})`,
          type: 'MANUAL_REQUEST'
        });

    } catch (dbError) {
        toast({ title: "Error", description: "Could not initiate upgrade.", variant: "destructive" });
        setIsProcessing(null);
        return;
    }
  
    try {
      const res = await createPaymentLink(
        finalAmount, 
        selectedPlan,
        {
          name: displayName,
          email: user.email,
          contact: phoneNumber,
        },
        user.uid,
        {
          basePrice,
          festiveDiscount,
          promoDiscount,
          promoCode,
        }
      );
  
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast({ title: "Payment Error", description: res.error || "Failed to create link.", variant: "destructive" });
        setIsProcessing(null);
      }
    } catch (err) {
      toast({ title: "Critical Error", description: "Checkout failed.", variant: "destructive" });
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {settings.festiveDiscount > 0 ? (
            <span className="flex items-center justify-center gap-2 text-primary font-semibold">
              <PartyPopper className="h-5 w-5" /> 
              {settings.festiveName}: {settings.festiveDiscount}% Off Storewide!
            </span>
          ) : 'Upgrade to unlock AI-powered career tools and unlimited features.'}
        </p>

        {/* Improved Toggle UI */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${annual ? "bg-primary" : "bg-slate-800"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${annual ? "translate-x-6" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <span className="text-[10px] text-green-500 font-black bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm flex items-end gap-2 text-left mx-auto">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="promo" className="text-xs uppercase text-muted-foreground">Promo Code</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="promo" 
              className="pl-9" 
              placeholder="e.g. SAVE50" 
              value={promoCodeInput} 
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} 
            />
          </div>
        </div>
        <Button variant="secondary" onClick={handleApplyPromo} disabled={isVerifyingPromo || !promoCodeInput}>
          {isVerifyingPromo ? <Loader2 className="animate-spin" /> : 'Apply'}
        </Button>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Star className="text-yellow-500" /> Free
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-4xl font-bold font-headline">
              ₹0<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 5 AI credits</li>
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 2 resumes</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full" disabled={plan === "free"}>
              <span>{plan === "free" ? "Current Plan" : "Active"}</span>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col relative overflow-hidden">
          {(settings.festiveDiscount > 0 || appliedPromo || annual) && <Badge className="absolute top-2 right-2 bg-green-500">Sale</Badge>}
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Trophy className="text-gray-400" /> Essentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex flex-col">
              {(settings.festiveDiscount > 0 || appliedPromo || annual) && (
                <span className="text-sm text-muted-foreground line-through">₹{settings.essentials}</span>
              )}
              <p className="text-4xl font-bold font-headline">₹{calculateMonthlyPrice(settings.essentials)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              {annual && <p className="text-[10px] text-muted-foreground mt-1 font-bold">Billed annually (₹{calculateMonthlyPrice(settings.essentials) * 12}/yr)</p>}
            </div>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 50 AI credits</li>
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Store 10 resumes</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button className="w-full" onClick={() => handlePayment("essentials")} disabled={isProcessing !== null || (plan !== "free" && plan !== "pending")}>
              {isProcessing === "essentials" ? <Loader2 className="animate-spin"/> : (plan === "essentials" ? "Current Plan" : "Upgrade")}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary border-2 relative flex flex-col overflow-hidden">
          <Badge className="absolute top-4 right-4" variant="secondary">Popular</Badge>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-amber-500" /> Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex flex-col">
              {(settings.festiveDiscount > 0 || appliedPromo || annual) && (
                <span className="text-sm text-muted-foreground line-through">₹{settings.pro}</span>
              )}
              <p className="text-4xl font-bold font-headline">₹{calculateMonthlyPrice(settings.pro)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              {annual && <p className="text-[10px] text-muted-foreground mt-1 font-bold">Billed annually (₹{calculateMonthlyPrice(settings.pro) * 12}/yr)</p>}
            </div>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited AI analysis</li>
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Unlimited resumes</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button className="w-full mt-2" onClick={() => handlePayment("pro")} disabled={isProcessing !== null || plan === "recruiter" || plan === "pro"}>
              {isProcessing === "pro" ? <Loader2 className="animate-spin"/> : plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col relative overflow-hidden">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Diamond className="text-blue-500" /> Recruiter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex flex-col">
              {(settings.festiveDiscount > 0 || appliedPromo || annual) && (
                <span className="text-sm text-muted-foreground line-through">₹{settings.recruiter}</span>
              )}
              <p className="text-4xl font-bold font-headline">₹{calculateMonthlyPrice(settings.recruiter)}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              {annual && <p className="text-[10px] text-muted-foreground mt-1 font-bold">Billed annually (₹{calculateMonthlyPrice(settings.recruiter) * 12}/yr)</p>}
            </div>
            <ul className="space-y-2 text-left text-sm">
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> AI Candidate Ranking</li>
              <li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> Recruiter Dashboard</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button className="w-full mt-2" onClick={() => handlePayment("recruiter")} disabled={isProcessing !== null || plan === "recruiter"}>
              {isProcessing === "recruiter" ? <Loader2 className="animate-spin"/> : plan === "recruiter" ? "Current Plan" : "Upgrade to Recruiter"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Trust signals */}
      <p className="text-center text-xs text-muted-foreground mt-12 font-medium uppercase tracking-widest">
        🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees
      </p>
    </div>
  )
}