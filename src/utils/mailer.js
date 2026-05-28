import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // force IPv4 — fixes ENETUNREACH on some hosts (Render, etc.)
});

export const sendVerificationMail = async (toEmail, verificationLink) => {
  if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are missing from environment variables.");
  }

  const emailObj = {
    from: `"Finance Tracker" <${process.env.SMTP_USERNAME}>`,
    to: toEmail,
    subject: "Verify Your Email",
    text: `Please verify your email by clicking the link: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #1f7cec;">Welcome to Finance Tracker!</h2>
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px;">
          Thank you for signing up. To complete your registration, please verify your email address by clicking the button below.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #ffffff; background-color: #1f7cec; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          If you did not sign up for this account, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; color: #666;">Best regards,<br>The Finance Tracker Team</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(emailObj);
  console.log("Verification email sent:", info.messageId);
  return { status: "success", messageId: info.messageId };
};
