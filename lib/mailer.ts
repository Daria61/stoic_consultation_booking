import nodemailer from "nodemailer";
import { getSMTPConfig } from "@/lib/env";

const config = getSMTPConfig();

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: false,
  auth: {
    user: config.user,
    pass: config.pass,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  await transporter.sendMail({
    from: config.user,
    to,
    subject,
    text,
    html,
  });
};
