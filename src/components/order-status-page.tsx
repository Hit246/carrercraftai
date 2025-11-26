'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hourglass, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export function OrderStatusPage() {
    const { plan, loading, userData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && plan !== 'pending') {
            // If the plan is already active or free, no need to be on this page.
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

    let StatusIcon = Hourglass;
    let title = "Your Upgrade is Pending";
    let description = "Your request to upgrade to the " + (userData?.requestedPlan || 'Pro') + " plan has been received. An administrator will review your payment shortly. Please upload your proof of payment on your profile page to expedite the process.";
    
    // This component should primarily handle the 'pending' state.
    // Other states are handled by redirects, but we can have fallbacks.
    if (plan === 'pro' || plan === 'recruiter') { 
        StatusIcon = CheckCircle;
        title = "Upgrade Successful!";
        description = "Your plan has been successfully upgraded. You now have access to all new features.";
    } else if (plan === 'free') {
        StatusIcon = XCircle;
        title = "Upgrade Canceled or Rejected";
        description = "Your previous upgrade request is no longer active. If you believe this is an error, please contact support.";
    }


    return (
        <div className="flex justify-center items-start pt-10 h-full">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900`}>
                        <StatusIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={() => router.push('/profile')}>
                        Go to My Profile
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
