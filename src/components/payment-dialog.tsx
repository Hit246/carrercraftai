import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: 'pro' | 'recruiter' | null;
}

const planDetails = {
    pro: { name: "Pro Plan", amount: 10 },
    recruiter: { name: "Recruiter Plan", amount: 49 },
}

export function PaymentDialog({ isOpen, onClose, onConfirm, plan }: PaymentDialogProps) {
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
                    <div className="flex flex-col items-center space-y-2">
                        <Label>Scan QR Code to Pay</Label>
                        <Image
                            src="https://placehold.co/200x200.png?text=Scan+Me"
                            alt="Payment QR Code"
                            width={200}
                            height={200}
                            className="rounded-lg border"
                            data-ai-hint="payment qr-code"
                        />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="upi-id">Or Pay using UPI ID</Label>
                        <Input id="upi-id" readOnly value="careercraft@upi" />
                    </div>
                    <div className="text-center text-sm text-muted-foreground pt-2">
                        After payment, please take a screenshot and upload it on your profile page to get your upgrade approved.
                    </div>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm}>
                       I have paid
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
