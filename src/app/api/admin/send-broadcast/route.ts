import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyString) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.");
  }

  try {
    let sanitizedKey = keyString.trim();
    // Remove potential surrounding quotes from env string
    if ((sanitizedKey.startsWith("'") && sanitizedKey.endsWith("'")) ||
      (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"'))) {
      sanitizedKey = sanitizedKey.slice(1, -1).trim();
    }

    const serviceAccount = JSON.parse(sanitizedKey);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error("❌ Failed to initialize Firebase Admin for broadcast:", e);
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = admin.firestore();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { subject, html, audience } = await req.json();

    if (!subject || !html) {
      return NextResponse.json({ success: false, error: "Subject and HTML body are required." }, { status: 400 });
    }

    // 1. Fetch targeted users
    let usersQuery: admin.firestore.Query = db.collection("users");

    if (audience !== "all") {
      usersQuery = usersQuery.where("plan", "==", audience);
    }

    const snapshot = await usersQuery.get();
    const ADMIN_EMAILS = ['hitarth0236@gmail.com', 'support@careercraftai.tech', 'hello@careercraftai.tech'];
    const emails = snapshot.docs
      .map((doc) => doc.data().email)
      .filter((email): email is string =>
        !!email &&
        typeof email === 'string' &&
        !ADMIN_EMAILS.includes(email)
      );
    if (emails.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No users found for the selected audience."
      });
    }

    console.log(`📧 Initiating broadcast to ${emails.length} users. Audience: ${audience}`);

    // 2. Send using Resend Batch API (max 100 per batch)
    // This is safer for privacy than putting 50 people in the 'to' field
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const emailBatch = emails.slice(i, i + batchSize);

      const batchPayload = emailBatch.map(email => ({
        from: "CareerCraft AI <hello@careercraftai.tech>",
        to: email,
        subject: subject,
        html: html,
      }));

      const { data, error } = await resend.batch.send(batchPayload);

      if (error) {
        console.error(`❌ Resend Batch Error at index ${i}:`, error);
        // We throw if the first batch fails, or log and continue
        if (sentCount === 0) throw error;
      } else if (data) {
        sentCount += emailBatch.length;
      }
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      total: emails.length
    });

  } catch (error: any) {
    console.error("Broadcast Critical Error:", error);
    return NextResponse.json({ success: false, error: error.message || "An internal error occurred during broadcast." }, { status: 500 });
  }
}
