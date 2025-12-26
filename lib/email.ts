import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Senpai Career <onboarding@resend.dev>",
      to: [to],
      subject: "Reset Your Password - Senpai Career",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(242, 106, 163, 0.1) 0%, rgba(245, 159, 193, 0.1) 35%, rgba(111, 211, 238, 0.1) 70%, rgba(76, 195, 230, 0.1) 100%); padding: 30px; border-radius: 10px;">
              <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px; font-weight: bold;">
                Reset Your Password
              </h1>
              
              <p style="color: #666; margin-bottom: 20px;">
                Hello ${name || "there"},
              </p>
              
              <p style="color: #666; margin-bottom: 20px;">
                We received a request to reset your password for your Senpai Career account. Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f26aa3 0%, #f59fc1 35%, #6fd3ee 70%, #4cc3e6 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; margin-bottom: 10px; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #4a90e2; word-break: break-all; font-size: 12px; margin-bottom: 20px;">
                ${resetUrl}
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                Best regards,<br>
                The Senpai Career Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error("Email sending error:", error);
    throw error;
  }
}

