
'use server'
import Razorpay from "razorpay"

function getRazorpay() {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET

  if (!id || !secret) {
    console.error("Razorpay ENV missing on server ❌", {
      hasId: !!id,
      hasSecret: !!secret
    })
    throw new Error("Missing Razorpay credentials")
  }

  console.log("Razorpay instance created with key:", id.substring(0, 10) + "...")
  return new Razorpay({ key_id: id, key_secret: secret })
}

export async function createPaymentLink(
  amount: number, 
  planName: string, 
  customer: { name: string; email: string; contact: string }
) {
  try {
    const razorpay = getRazorpay()
    console.log("Creating Payment Link >>>", { amount, planName, customer })

    // Payment Link API requires these specific fields
    const paymentLinkData = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      description: `Upgrade to ${planName}`,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      callback_method: "get" as const
    }

    console.log("Payment Link Request:", JSON.stringify(paymentLinkData, null, 2))

    const link = await razorpay.paymentLink.create(paymentLinkData)

    console.log("Payment Link created ✅", {
      id: link.id,
      short_url: link.short_url,
      status: link.status
    })

    return { 
      success: true, 
      url: link.short_url,
      linkId: link.id 
    }

  } catch (err: any) {
    // Razorpay errors have specific structure
    console.error("Payment Link Error >>>", {
      message: err.message,
      description: err.description,
      code: err.code,
      statusCode: err.statusCode,
      source: err.source,
      step: err.step,
      reason: err.reason,
      metadata: err.metadata,
      raw: JSON.stringify(err, null, 2)
    })
    
    return { 
      success: false, 
      error: err.description || err.message || "Failed to create payment link. Please try again." 
    }
  }
}

export async function createRazorpayOrder(amount: number, planName: string) {
  try {
    const razorpay = getRazorpay()
    
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: planName
      }
    })

    return { success: true, orderId: order.id, amount: order.amount }
  } catch (err: any) {
    console.error("Order creation error:", err)
    return { success: false, error: err.description || err.message }
  }
}

export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const crypto = require("crypto")
    const secret = process.env.RAZORPAY_KEY_SECRET

    if (!secret) {
      throw new Error("Missing Razorpay secret")
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex")

    const isValid = expectedSignature === razorpaySignature

    return { success: isValid }
  } catch (err: any) {
    console.error("Payment verification error:", err)
    return { success: false, error: err.message }
  }
}
