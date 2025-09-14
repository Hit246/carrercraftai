'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { getPaymentSettings } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: 'pro' | 'recruiter' | null;
}

interface PaymentSettings {
    upiId: string;
    qrCodeImageUrl: string;
}

const planDetails = {
    pro: { name: "Pro Plan", amount: 10 },
    recruiter: { name: "Recruiter Plan", amount: 49 },
}

export function PaymentDialog({ isOpen, onClose, onConfirm, plan }: PaymentDialogProps) {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getPaymentSettings().then(data => {
                setSettings(data as PaymentSettings);
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    if (!plan) return null;

    const details = planDetails[plan];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Your Payment</DialogTitle>
                    <DialogDescription>
                        To upgrade to the {details.name}, please complete the payment of ${details.amount}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {isLoading || !settings ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-48 w-48 rounded-lg" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center space-y-2">
                                <Label>Scan QR Code to Pay</Label>
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
                        </>
                    )}
                    <div className="text-center text-sm text-muted-foreground pt-2">
                        After payment, please take a screenshot and upload it on your profile page to get your upgrade approved.
                    </div>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={isLoading}>
                       I have paid
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
