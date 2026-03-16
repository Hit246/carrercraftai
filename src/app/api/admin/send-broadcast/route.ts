import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin lazily
function initAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyString) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.");
  }

  try {
    let sanitizedKey = keyString.trim();
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

    // 1. Fetch targeted users
    let usersQuery: admin.firestore.Query = db.collection("users");
    
    if (audience !== "all") {
      usersQuery = usersQuery.where("plan", "==", audience);
    }

    const snapshot = await usersQuery.get();
    const emails = snapshot.docs
      .map((doc) => doc.data().email)
      .filter((email): email is string => !!email && typeof email === 'string');

    if (emails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No users found for the selected audience." 
      });
    }

    console.log(`📧 Starting broadcast to ${emails.length} users. Audience: ${audience}`);

    // 2. Send in batches of 50 (Resend limit per request for 'to' array)
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const { data, error } = await resend.emails.send({
        from: "CareerCraft AI <support@careercraftai.tech>",
        to: batch,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error(`❌ Resend Error in batch ${i / batchSize}:`, error);
        // We continue with other batches even if one fails
      } else {
        sentCount += batch.length;
      }
    }

    return NextResponse.json({ 
        success: true, 
        count: sentCount,
        total: emails.length 
    });

  } catch (error: any) {
    console.error("Broadcast Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
