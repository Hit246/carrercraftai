
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { uploadFile } from "@/lib/firebase";
import { Loader2, Upload } from "lucide-react";
import { getPaymentSettings } from "@/lib/actions";

type PlanToUpgrade = 'essentials' | 'pro' | 'recruiter' | null;

interface PaymentSettings {
    upiId: string;
    qrCodeImageUrl: string;
}

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentProofURL: string) => void;
    plan: PlanToUpgrade;
}


const planDetails = {
    essentials: { name: "Essentials Plan", amount: 199 },
    pro: { name: "Pro Plan", amount: 399 },
    recruiter: { name: "Recruiter Plan", amount: 999 },
}

const formSchema = z.object({
    proofFile: z.instanceof(File).refine(file => file.size > 0, "Please upload proof of payment."),
});

export function PaymentDialog({ isOpen, onClose, onConfirm, plan }: PaymentDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (!isOpen) return;
        
        async function fetchSettings() {
            setIsLoadingSettings(true);
            try {
                const data = await getPaymentSettings();
                setSettings(data as PaymentSettings);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Could not load payment details. Please try again.',
                    variant: 'destructive',
                });
                onClose();
            } finally {
                setIsLoadingSettings(false);
            }
        }
        
        fetchSettings();
    }, [isOpen, toast, onClose]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({ title: 'Not Authenticated', description: 'You must be logged in.', variant: 'destructive'});
            return;
        }
        
        setIsConfirming(true);
        try {
            const proofUrl = await uploadFile(values.proofFile, `payment_proofs/${user.uid}/${values.proofFile.name}`);
            onConfirm(proofUrl);
            form.reset();
        } catch(e) {
             toast({
                title: 'Upload Failed',
                description: 'Could not upload your payment proof. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsConfirming(false);
        }
    }


    if (!plan) return null;

    const details = planDetails[plan];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!isConfirming) onClose()}}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Your Upgrade</DialogTitle>
                    <DialogDescription>
                        To upgrade to the {details.name}, pay ₹{details.amount} and upload the payment screenshot below.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {isLoadingSettings || !settings ? (
                            <div className="flex flex-col items-center space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-48 w-48 rounded-lg" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center space-y-2">
                                    <Label>1. Scan QR Code to Pay</Label>
                                    <Image
                                        src={settings.qrCodeImageUrl}
                                        alt="Payment QR Code"
                                        width={200}
                                        height={200}
                                        className="rounded-lg border"
                                        data-ai-hint="payment qrcode from admin settings"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="upi-id">Or Pay using UPI ID</Label>
                                    <Input id="upi-id" readOnly value={settings.upiId} />
                                </div>
                                 <FormField
                                    control={form.control}
                                    name="proofFile"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>2. Upload Payment Proof</FormLabel>
                                        <FormControl>
                                             <div className="relative">
                                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="file"
                                                    className="pl-10"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => field.onChange(e.target.files?.[0])}
                                                    disabled={isConfirming}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </>
                        )}
                        <DialogFooter className="sm:justify-center pt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isConfirming}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoadingSettings || isConfirming}>
                               {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               I have paid & Uploaded Proof
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
