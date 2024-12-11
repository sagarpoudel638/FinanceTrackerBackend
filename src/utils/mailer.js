import nodemailer from "nodemailer";

// Create the transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASS,
  
  },
  logger: true, 
  debug: true,
});

// Function to send verification email
export const sendVerificationMail = async (toEmail, verificationLink) => {
  try {
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials are missing in the environment variables.");
    }

    console.log(`SMTP User: ${process.env.SMTP_USERNAME}`);
   
    const emailObj = {
      from: `"Support Team" <${process.env.SMTP_USERNAME}>`, // sender address
      to: toEmail, // recipient address
      subject: "Verify Your Email", // Subject line
      text: `Please verify your email by clicking the link: ${verificationLink}`, // Plain text body for fallback
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #1f7cec;">Welcome to Our Service!</h2>
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
          <p style="font-size: 14px; color: #666;">Best regards,<br>The Support Team</p>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(emailObj);

    console.log("Message sent: %s", info.messageId);
    return { status: "success", messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error.message);
    return { status: "error", message: error.message };
  }
};