import nodemailer from "nodemailer";


// NodeMailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Reset Your Password Securely",
    text: `Hello,\n\nWe received a request to reset your password. Click the secure link below to proceed:\n\n${resetUrl}\n\nIf you didn’t request this, you can safely ignore this email.\n\nStay secure,\nYour Company Team`,
    html: `<p>Hello,</p>
           <p>We received a request to reset your password. Click the secure link below to proceed:</p>
           <p><a href="${resetUrl}" style="color:blue; text-decoration:underline;">Reset Your Password</a></p>
           <p>If you didn’t request this, you can safely ignore this email.</p>
           <p>Stay secure,</p>
           <p>Task Vault</p>`,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${to}:`, error);
  }
};
