'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hourglass, CheckCircle, XCircle, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

export function OrderStatusPage() {
    const { plan, loading, userData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && plan !== 'pending') {
            router.push('/dashboard');
        }
    }, [plan, loading, router]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-lg">
                    <CardHeader className="items-center text-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-8 w-48 mt-4" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-40 mx-auto mt-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isAwaitingVerification = !!userData?.paymentProofURL || !!userData?.paymentId;

    return (
        <div className="flex justify-center items-start pt-10 h-full fade-in">
            <Card className="w-full max-w-lg border-primary/10 shadow-2xl">
                <CardHeader className="items-center text-center space-y-4">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isAwaitingVerification ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                        {isAwaitingVerification ? <ShieldCheck className="w-10 h-10" /> : <CreditCard className="w-10 h-10" />}
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-headline">
                            {isAwaitingVerification ? "Upgrade in Progress" : "Complete Your Payment"}
                        </CardTitle>
                        <CardDescription className="max-w-xs mx-auto mt-2">
                            {isAwaitingVerification 
                                ? `We've received your details for the ${userData?.requestedPlan || 'Pro'} plan. Our team is verifying your payment.`
                                : `You're just one step away from unlocking the ${userData?.requestedPlan || 'Pro'} plan features.`
                            }
                        </CardDescription>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {!isAwaitingVerification && userData?.lastPaymentLink && (
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4 text-center">
                            <p className="text-sm font-medium">To activate your plan immediately, please finish the secure Razorpay checkout.</p>
                            <Button className="w-full h-12 btn-gradient text-lg font-bold" asChild>
                                <a href={userData.lastPaymentLink}>
                                    Resume Payment <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    )}

                    {isAwaitingVerification && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/40">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Hourglass className="h-5 w-5 text-green-600 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Queue</p>
                                <p className="text-sm font-bold">Standard Review: 2-4 Hours</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full h-11 font-bold rounded-xl" asChild>
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                            <Link href="/settings">View Billing Details</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
