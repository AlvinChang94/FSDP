const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "queryease9@gmail.com",
    pass: "jlkh fzef dqoh zadp"
  }
});

async function sendVerificationEmail({ to, code }) {
  const subject = "Verify your email";
  const body = `Your verification code is: ${code}`;

  try {
    const info = await transporter.sendMail({
      from: `"QueryEase" <queryease9@gmail.com>`,
      to,
      subject,
      text: body
    });

    console.log("Verification email sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw err;
  }
}

module.exports = { sendVerificationEmail };
