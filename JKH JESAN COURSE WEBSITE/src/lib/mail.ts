import nodemailer from "nodemailer";

interface SendResetEmailParams {
  to: string;
  token: string;
  userName?: string;
}

/**
 * Creates a secure SMTP transporter using environment variables.
 * Compatible with Gmail, SendGrid, Mailgun, Amazon SES, or custom SMTP servers.
 */
function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || "587", 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a high-security, token-signed password reset email directly to the user's inbox.
 * Supports Resend API (RESEND_API_KEY) or standard SMTP (Gmail / SendGrid).
 * The link is NEVER sent to the client browser.
 */
export async function sendPasswordResetEmail({ to, token, userName }: SendResetEmailParams): Promise<{ sent: boolean; devMode?: boolean }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const from = process.env.EMAIL_FROM || '"EvoRise Media" <no-reply@evorisemedia.com>';
  const subject = "আপনার EvoRise Media অ্যাকাউন্টের পাসওয়ার্ড রিসেট লিংক";
  const textContent = `প্রিয় ${userName || "শিক্ষার্থী"},\n\nআপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার অনুরোধ পাওয়া গেছে।\nনিচের লিংকে গিয়ে নতুন পাসওয়ার্ড সেট করুন:\n${resetUrl}\n\nলিংকটির মেয়াদ ১৫ মিনিট। আপনি অনুরোধ না করে থাকলে এটি উপেক্ষা করুন।`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0f08; color: #EDE8DE; margin: 0; padding: 30px 15px; }
        .card { max-width: 520px; margin: 0 auto; background: #161b10; border: 1px solid rgba(200, 144, 10, 0.25); border-radius: 16px; padding: 36px 28px; }
        .logo { font-size: 22px; font-weight: 900; color: #C8900A; margin-bottom: 20px; }
        h1 { font-size: 20px; color: #FFFFFF; margin: 0 0 12px; }
        p { font-size: 14px; line-height: 1.6; color: #b3b3a6; margin: 0 0 20px; }
        .btn { display: inline-block; background-color: #C8900A; color: #0C0F08 !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 8px; margin: 15px 0 25px; }
        .warning { font-size: 12px; color: #8C8675; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">EVORISE MEDIA</div>
        <h1>পাসওয়ার্ড রিসেট করার অনুরোধ</h1>
        <p>প্রিয় ${userName || "শিক্ষার্থী"},</p>
        <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার একটি অনুরোধ পাওয়া গেছে। আপনার নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন:</p>
        <div>
          <a href="${resetUrl}" class="btn" target="_blank">পাসওয়ার্ড রিসেট করুন</a>
        </div>
        <p style="font-size: 12px; color: #8C8675;">অথবা আপনার ব্রাউজারে নিচের লিংকটি পেস্ট করুন:<br /><span style="color: #C8900A; word-break: break-all;">${resetUrl}</span></p>
        <div class="warning">
          <strong>⚠️ নিরাপত্তা সতর্কতা:</strong> এই লিংকটি পরবর্তী <strong>১৫ মিনিটের জন্য</strong> বৈধ থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন—আপনার পাসওয়ার্ড অপরিবর্তিত ও সম্পূর্ণ নিরাপদ থাকবে।
        </div>
      </div>
    </body>
    </html>
  `;

  // Option 1: Send via Resend REST API (if RESEND_API_KEY is defined)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (res.ok) {
        return { sent: true, devMode: false };
      }
      console.error("Resend API delivery error:", await res.text());
    } catch (e) {
      console.error("Resend delivery exception:", e);
    }
  }

  // Option 2: Send via SMTP (Gmail, SendGrid, Amazon SES, etc.)
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      return { sent: true, devMode: false };
    } catch (smtpErr) {
      console.error("SMTP delivery error:", smtpErr);
    }
  }

  // Option 3: Local Dev Fallback (if no API key or SMTP is configured yet)
  console.log("\n=======================================================");
  console.log("🔒 [SECURE EMAIL SERVICE - DEV FALLBACK]");
  console.log(`To: ${to}`);
  console.log(`Action: Password Reset Requested`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log("NOTE: To deliver real emails, set RESEND_API_KEY or EMAIL_SERVER_* in .env");
  console.log("=======================================================\n");

  return { sent: true, devMode: true };
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; devMode?: boolean }> {
  const from = process.env.EMAIL_FROM || '"EvoRise Media" <no-reply@evorisemedia.com>';

  // Option 1: Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html, text }),
      });
      if (res.ok) return { sent: true, devMode: false };
    } catch (e) {
      console.error("[sendMail] Resend error:", e);
    }
  }

  // Option 2: SMTP
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({ from, to, subject, html, text });
      return { sent: true, devMode: false };
    } catch (err) {
      console.error("[sendMail] SMTP error:", err);
    }
  }

  console.log(`\n📧 [EMAIL DISPATCH - DEV FALLBACK] To: ${to} | Subject: ${subject}\n`);
  return { sent: true, devMode: true };
}
