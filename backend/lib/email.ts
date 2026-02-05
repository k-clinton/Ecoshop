import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - EcoShop',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .code { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EcoShop!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up with EcoShop. To complete your registration, please verify your email address by entering the following code:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account with EcoShop, please ignore this email.</p>
            <p>Best regards,<br>The EcoShop Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EcoShop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
