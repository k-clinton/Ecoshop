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

export async function sendOrderConfirmationEmail(email: string, order: any, name: string) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const itemsHtml = order.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.name || 'Product'} x ${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
    `).join('');

  const mailOptions = {
    from: `"EcoShop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmation - #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .order-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .total-row { font-weight: bold; border-top: 2px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for your order! We've received your order #${order.id} and are processing it now.</p>
            
            <div class="order-details">
                <h3>Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${itemsHtml}
                    <tr>
                        <td style="padding: 10px;">Subtotal</td>
                        <td style="padding: 10px; text-align: right;">${formatPrice(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">Shipping</td>
                        <td style="padding: 10px; text-align: right;">${formatPrice(order.shipping)}</td>
                    </tr>
                    <tr class="total-row">
                        <td style="padding: 10px;">Total</td>
                        <td style="padding: 10px; text-align: right;">${formatPrice(order.total)}</td>
                    </tr>
                </table>
            </div>

            <p>We'll send you another email when your order ships.</p>
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
    console.log(`Sending order confirmation email to ${email} for order ${order.id}`);
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw logic error here, just log it so order process doesn't fail
    return { success: false, error };
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
