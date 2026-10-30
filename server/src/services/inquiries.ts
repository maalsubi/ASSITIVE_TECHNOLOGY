import { mkdir, appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Inquiry } from "../models/Inquiry.js";
import type { ContactInput } from "../../../shared/contact.js";
export async function saveInquiry(input: ContactInput) {
  const { website: _, ...data } = input;
  const record = {
    ...data,
    reference: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  if (process.env.MONGODB_URI) {
    if (mongoose.connection.readyState !== 1)
      throw new Error("Database unavailable");
    await Inquiry.create(record);
  } else {
    const dir = process.env.INQUIRY_DATA_DIR || resolve(process.cwd(), "data");
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await appendFile(
      resolve(dir, "inquiries.jsonl"),
      JSON.stringify(record) + "\n",
      { mode: 0o600 },
    );
  }
  return record;
}
export async function notifyInquiry(
  record: Awaited<ReturnType<typeof saveInquiry>>,
) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, CONTACT_TO } =
    process.env;
  if (!SMTP_HOST || !MAIL_FROM || !CONTACT_TO) return;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_PORT === "465",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });
  await transport.sendMail({
    from: MAIL_FROM,
    to: CONTACT_TO,
    replyTo: record.email,
    subject: `TSI inquiry: ${record.subject}`,
    text: `Reference: ${record.reference}\nFrom: ${record.name} <${record.email}>\nOrganization: ${record.organization}\n\n${record.message}`,
  });
}
