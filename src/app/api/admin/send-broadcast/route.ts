import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

// Build email HTML on server side
function buildEmailHTML(bodyContent: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;width:600px;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #f1f5f9;text-align:center;">
              <img src="https://careercraftai.tech/logo.jpg" width="48" height="48" style="border-radius:10px;" />
              <h1 style="color:#0f172a;font-size:22px;margin:16px 0 0;font-weight:700;">CareerCraft AI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#334155;font-size:16px;line-height:1.6;">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://careercraftai.tech/dashboard"
                style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
                Go to Dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="color:#64748b;font-size:12px;margin:0;">
                2026 CareerCraft AI
                <a href="https://careercraftai.tech/privacy" style="color:#3b82f6;text-decoration:none;margin-left:8px;">Privacy Policy</a>
                <a href="https://careercraftai.tech/contact" style="color:#3b82f6;text-decoration:none;margin-left:8px;">Contact</a>
              </p>
              <p style="color:#94a3b8;font-size:11px;margin-top:8px;">
                You received this email because you are a registered user of CareerCraft AI.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
    console.error("Failed to initialize Firebase Admin:", e);
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = admin.firestore();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { subject, bodyContent, audience } = await req.json();

    if (!subject || !bodyContent) {
      return NextResponse.json(
        { success: false, error: "Subject and body are required." },
        { status: 400 }
      );
    }

    // Build HTML on server
    const finalHtml = buildEmailHTML(bodyContent);

    // Fetch users
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

    console.log(`Sending broadcast to ${emails.length} users. Audience: ${audience}`);

    // Send in batches of 100
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const emailBatch = emails.slice(i, i + batchSize);

      const batchPayload = emailBatch.map(email => ({
        from: "CareerCraft AI <hello@careercraftai.tech>",
        to: email,
        subject: subject,
        html: finalHtml,
      }));

      const { data, error } = await resend.batch.send(batchPayload);

      if (error) {
        console.error(`Resend Batch Error at index ${i}:`, error);
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
    return NextResponse.json(
      { success: false, error: error.message || "An internal error occurred." },
      { status: 500 }
    );
  }
}