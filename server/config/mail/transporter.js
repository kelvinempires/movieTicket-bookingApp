import nodemailer from "nodemailer";

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  throw new Error(
    "Missing SMTP_USER or SMTP_PASSWORD in environment variables"
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default transporter;
