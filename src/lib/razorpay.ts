'use server'
import Razorpay from "razorpay"

let razorpayInstance: Razorpay | null = null

function getRazorpay() {
  if (razorpayInstance) return razorpayInstance

  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET

  if (!id || !secret) {
    console.error("Razorpay ENV missing on server ❌")
    throw new Error("Missing Razorpay keys")
  }

  razorpayInstance = new Razorpay({ key: id, secret: secret })
  return razorpayInstance
}

export async function createPaymentLink(amount: number, planName: string) {
  const razorpay = getRazorpay()

  console.log("Attempting Payment Link >>>", { amount, planName })

  try {
    const link = await razorpay.payment_links.create({
      amount: amount * 100,
      currency: "INR",
      description: `Upgrade to ${planName}`,
      receipt: `receipt_${Date.now()}`,
      notify: { sms: true, email: true },
      reminder_enable: true,
    })

    console.log("Payment Link created ✅ >>>", link.short_url)
    return { success: true, url: link.short_url }

  } catch (err: any) {
    console.error("Payment Link crashed RAW >>>", err, typeof err)
    return { success: false, error: "Payment Link creation crashed" }
  }
}
