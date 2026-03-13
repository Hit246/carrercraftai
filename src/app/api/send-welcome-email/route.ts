import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const emails = [
  {
    delay: 0,
    subject: "Welcome to CareerCraft AI 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #3b82f6;">Welcome aboard!</h2>
        <p>Your free account is ready. Here's how to get the most out of CareerCraft AI:</p>
        <ol>
          <li><strong>Build your resume</strong> — Use our live preview builder with professional templates.</li>
          <li><strong>Run ATS Analysis</strong> — Paste any job description and get a match score instantly.</li>
          <li><strong>Generate a Cover Letter</strong> — Create a personalized letter tailored to your dream role.</li>
        </ol>
        <div style="margin-top: 30px;">
          <a href="https://careercraftai.tech/dashboard" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Build My Resume →
          </a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 40px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  },
  {
    delay: 2,
    subject: "Have you tried the ATS Optimizer? 🤖",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #3b82f6;">Your resume might be getting filtered out</h2>
        <p>Did you know that 75% of resumes are rejected by bots before a human ever sees them?</p>
        <p>Paste any job description into our <strong>ATS Optimizer</strong> and see exactly how well you match.</p>
        <div style="margin-top: 30px;">
          <a href="https://careercraftai.tech/ats-optimizer" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Try ATS Optimizer →
          </a>
        </div>
      </div>
    `,
  },
  {
    delay: 5,
    subject: "⚠️ Your 5 free AI credits are waiting",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #3b82f6;">Don't let your free credits go to waste</h2>
        <p>You have <strong>5 free AI credits</strong> available on your account.</p>
        <p>Use them today to get personalized feedback on your resume's strengths and weaknesses.</p>
        <div style="margin-top: 30px;">
          <a href="https://careercraftai.tech/resume-analyzer" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Use My Credits →
          </a>
        </div>
      </div>
    `,
  },
  {
    delay: 10,
    subject: "Users who used AI feedback got 3x more callbacks 📈",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #3b82f6;">Boost your callback rate</h2>
        <p>CareerCraft AI users who implement our AI Analyzer suggestions receive, on average, <strong>3x more interview callbacks</strong>.</p>
        <p>It takes less than 2 minutes to run an audit. Why not try it now?</p>
        <div style="margin-top: 30px;">
          <a href="https://careercraftai.tech/resume-analyzer" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Analyze My Resume →
          </a>
        </div>
      </div>
    `,
  },
];

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ Resend API key is missing in .env. Skipping welcome email sequence.");
    return NextResponse.json({ success: false, message: "API key missing" });
  }

  try {
    const resend = new Resend(apiKey);
    const { email, name } = await req.json();

    console.log(`📧 Initiating email drip for: ${email}`);

    // Send Day 0 email immediately
    const welcomeResult = await resend.emails.send({
      from: "CareerCraft AI <hello@careercraftai.tech>",
      to: email,
      subject: emails[0].subject,
      html: emails[0].html.replace(/aboard!/g, `aboard, ${name || "there"}!`),
    });

    if (welcomeResult.error) {
        console.error("❌ Resend Error (Day 0):", welcomeResult.error);
    }

    // Schedule Day 2, 5, 10
    for (const drip of emails.slice(1)) {
      const sendAt = new Date();
      sendAt.setDate(sendAt.getDate() + drip.delay);

      const scheduledResult = await resend.emails.send({
        from: "CareerCraft AI <hello@careercraftai.tech>",
        to: email,
        subject: drip.subject,
        html: drip.html,
        scheduledAt: sendAt.toISOString(),
      });

      if (scheduledResult.error) {
          console.error(`❌ Resend Error (Day ${drip.delay}):`, scheduledResult.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
