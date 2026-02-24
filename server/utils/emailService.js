const nodemailer = require('nodemailer');

// Initialize the Nodemailer transporter
// Replace with real SMTP credentials in production (.env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your_email@gmail.com', // fallback mock
    pass: process.env.SMTP_PASS || 'your_app_password', // fallback mock
  },
});

/**
 * Send an email using the configured transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML formatted email body
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Warranty Tracker" <${process.env.SMTP_USER || 'noreply@warrantytracker.com'}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Generates the HTML template for a warranty expiration warning
 */
const generateWarrantyWarningHTML = (userName, productName, daysLeft) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Warranty Expiring Soon</h2>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          This is a friendly reminder that the warranty for your <strong>${productName}</strong> is expiring in <strong>${daysLeft} days</strong>.
        </p>
        <p style="font-size: 16px; color: #333;">
          Please log in to your dashboard to review your coverage options or schedule a final maintenance check before the deadline.
        </p>
        <a href="http://localhost:5173/products" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #EC4899; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Product Details
        </a>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #777; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Warranty Tracker. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">You are receiving this because you opted into email notifications.</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  generateWarrantyWarningHTML
};