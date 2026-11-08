import { siteConfig } from "@/config/site";
import type { AdminRole } from "@/types";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  inviteLink?: string;
}

const sentEmailsLog: EmailPayload[] = [];

export function getSentEmailsLog(): EmailPayload[] {
  return [...sentEmailsLog];
}

export async function sendAdminInvitationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  invitedByName: string;
  invitationToken: string;
  role?: AdminRole;
}) {
  const roleLabel =
    params.role === "SUPER_ADMIN" ? "Super Admin" : "Editor Admin";
  const inviteLink = `${siteConfig.url}/admin/accept-invite?token=${encodeURIComponent(
    params.invitationToken
  )}`;

  const subject = `Verify Your ${roleLabel} Account - ${siteConfig.name}`;
  const text = [
    `Hello ${params.recipientName},`,
    "",
    `${params.invitedByName} has assigned your email (${params.recipientEmail}) the ${roleLabel} role on the ${siteConfig.name} administrative platform.`,
    "",
    `Click the verification link below to verify your email address and set your password:`,
    inviteLink,
    "",
    `Once you set your password, your account will be activated immediately with ${roleLabel} permissions.`,
    "",
    `Grace and peace,`,
    siteConfig.name,
  ].join("\n");

  const payload: EmailPayload = {
    to: params.recipientEmail,
    subject,
    text,
    inviteLink,
  };
  sentEmailsLog.push(payload);

  // If RESEND_API_KEY is configured in .env, deliver the email via Resend HTTP API
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL?.trim() ||
    `Agape Communion Church <noreply@agapecommunion.org.ng>`;

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.recipientEmail],
          subject,
          text,
        }),
      });
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
    }
  }

  return { sent: true, inviteLink };
}
