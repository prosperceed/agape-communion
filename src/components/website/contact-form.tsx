"use client";

import { useState } from "react";
import { submitContactFormAction } from "@/features/contact/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const res = await submitContactFormAction({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    setSubmitting(false);
    if (res.success) {
      toast.success(
        res.message || "Your message has been sent to the church office."
      );
      setFeedback({
        type: "success",
        text:
          res.message ||
          "Thank you. Your message has been received by our church office.",
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(res.error || "Unable to send message.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
        <p className="text-xs text-slate-600">
          Have a question, prayer request, or planning your first visit? Fill
          out the form below.
        </p>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-sm p-3.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Full Name</Label>
          <Input
            id="contact-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email Address</Label>
          <Input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone">Phone Number (Optional)</Label>
          <Input
            id="contact-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 ..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            id="contact-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="First Time Visit / Prayer Request / Inquiry"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we pray for you or assist you?"
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

