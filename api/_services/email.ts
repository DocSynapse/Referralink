// Email Service for ReferraLink
// Handles verification emails, notifications, and transactional messages

/**
 * Email Service Interface
 *
 * MVP: Console logging for development
 * Production: Integrate with Resend (recommended) or SendGrid
 *
 * Resend Setup:
 * 1. npm install resend
 * 2. Get API key from https://resend.com
 * 3. Add RESEND_API_KEY to .env
 * 4. Uncomment production implementation below
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationToken: string
): Promise<boolean> {

  const verificationUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikasi Email - ReferraLink</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ReferraLink by Sentra</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">Platform Rujukan Medis Terpercaya</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Halo, ${fullName}!</h2>

          <p>Terima kasih telah mendaftar di ReferraLink. Untuk mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Verifikasi Email Saya
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Atau salin dan tempel link berikut ke browser Anda:</p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #555;">
            ${verificationUrl}
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Link verifikasi ini berlaku selama 24 jam.<br>
              Jika Anda tidak membuat akun di ReferraLink, abaikan email ini.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2026 Sentra Solutions. All rights reserved.</p>
          <p>Jakarta, Indonesia</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Halo, ${fullName}!

Terima kasih telah mendaftar di ReferraLink.

Untuk mengaktifkan akun Anda, silakan verifikasi email dengan mengklik link berikut:
${verificationUrl}

Link ini berlaku selama 24 jam.

Jika Anda tidak membuat akun di ReferraLink, abaikan email ini.

---
ReferraLink by Sentra Solutions
Jakarta, Indonesia
  `;

  return await sendEmail({
    to: email,
    subject: 'Verifikasi Email Anda - ReferraLink',
    html,
    text
  });
}

/**
 * Send welcome email after successful onboarding
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  role: string,
  apiKey: string
): Promise<boolean> {

  const dashboardUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Selamat Datang di ReferraLink!</h1>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Halo, ${fullName}!</h2>

          <p>Akun Anda telah berhasil diaktifkan. Anda sekarang dapat mengakses platform ReferraLink.</p>

          <div style="background: #f0f4ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Informasi Akun Anda</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0;"><strong>Email:</strong></td>
                <td style="padding: 5px 0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Role:</strong></td>
                <td style="padding: 5px 0;">${role}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff9e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffa500;">
            <h3 style="margin-top: 0; color: #ff8800;">🔑 API Key Anda</h3>
            <p style="margin: 0; font-size: 14px; color: #666;">Simpan API key ini dengan aman. Anda akan membutuhkannya untuk integrasi sistem.</p>
            <code style="display: block; background: #333; color: #0f0; padding: 15px; border-radius: 5px; margin-top: 10px; word-break: break-all; font-size: 12px;">
              ${apiKey}
            </code>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}"
               style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Buka Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <h3 style="color: #667eea;">Langkah Selanjutnya</h3>
            <ul style="color: #555; font-size: 14px;">
              <li>Lengkapi profil Anda di dashboard</li>
              <li>Jelajahi fitur-fitur yang tersedia sesuai role Anda</li>
              <li>Hubungi support jika ada pertanyaan</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2026 Sentra Solutions. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Selamat Datang di ReferraLink - Akun Aktif',
    html
  });
}

/**
 * Core email sending function
 *
 * MVP: Console logging
 * Production: Use Resend or SendGrid
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {

  // MVP Implementation: Log to console
  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: options.subject,
    preview: options.html.substring(0, 100) + '...'
  });

  // Return success for MVP
  return true;

  // PRODUCTION: Uncomment and use Resend
  /*
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'ReferraLink <noreply@sentra.id>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });

    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
  */
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  resetToken: string
): Promise<boolean> {

  const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Reset Password - ReferraLink</h2>
        <p>Halo, ${fullName}!</p>
        <p>Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah untuk melanjutkan:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Link ini berlaku selama 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Password - ReferraLink',
    html
  });
}
