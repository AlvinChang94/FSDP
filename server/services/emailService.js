import nodemailer from "nodemailer";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "queryease9@gmail.com",
    pass: "jlkh fzef dqoh zadp"
  }
});

export async function sendEscalationEmail({ to, subject, body }) {
  try {
    const info = await transporter.sendMail({
      from: `"Chatbot Escalation" <queryease9@gmail.com>`,
      to,
      subject,
      text: body,
      // html: `<p>${body}</p>` // if you want HTML
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}



const sns = new SNSClient({ region: "us-east-1" }); // pick your region

export async function sendEscalationSMS({ phoneNumber, message }) {
  try {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber // must be in E.164 format, e.g. +6591234567
    };

    const result = await sns.send(new PublishCommand(params));
    console.log("SMS sent, MessageId:", result.MessageId);
  } catch (err) {
    console.error("Error sending SMS:", err);
    throw err;
  }
}

