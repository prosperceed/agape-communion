"use client";

import { useState } from "react";
import { submitPublicTestimonyAction } from "@/features/testimonies/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function TestimonySubmissionForm() {
  const [title, setTitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [roleOrRelation, setRoleOrRelation] = useState("");
  const [fullTestimony, setFullTestimony] = useState("");
  const [displayPersonName, setDisplayPersonName] = useState(true);
  const [hasStoryPermission, setHasStoryPermission] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const res = await submitPublicTestimonyAction({
      title,
      personName,
      roleOrRelation,
      fullTestimony,
      displayPersonName,
      hasStoryPermission,
      hasMediaPermission,
    });

    setSubmitting(false);
    if (res.success) {
      toast.success(
        res.message || "Testimony submitted for pastoral review."
      );
      setFeedback({
        type: "success",
        text:
          res.message ||
          "Thank you. Your testimony has been submitted for pastoral review.",
      });
      setTitle("");
      setPersonName("");
      setRoleOrRelation("");
      setFullTestimony("");
      setHasStoryPermission(false);
      setHasMediaPermission(false);
    } else {
      toast.error(res.error || "Unable to submit testimony.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900">
          Share Your Testimony
        </h3>
        <p className="text-xs text-slate-600">
          Submitted testimonies are reviewed by our pastoral team before
          publication.
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
          <Label htmlFor="testimony-name">Full Name</Label>
          <Input
            id="testimony-name"
            required
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="e.g., Brother Chinedu Obi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="testimony-role">Fellowship or Department</Label>
          <Input
            id="testimony-role"
            value={roleOrRelation}
            onChange={(e) => setRoleOrRelation(e.target.value)}
            placeholder="e.g., Congregation Member"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="testimony-title">Testimony Title</Label>
        <Input
          id="testimony-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief headline of what God has done"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="testimony-story">Full Testimony</Label>
        <Textarea
          id="testimony-story"
          required
          rows={4}
          value={fullTestimony}
          onChange={(e) => setFullTestimony(e.target.value)}
          placeholder="Share your testimony of answered prayer, healing, or spiritual growth..."
        />
      </div>

      <div className="space-y-2.5 rounded-sm bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">
          Privacy & Publication Permissions
        </p>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={displayPersonName}
            onChange={(e) => setDisplayPersonName(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C]"
          />
          <span>
            Display my name publicly with this testimony (uncheck to publish as
            &ldquo;Church Member&rdquo;).
          </span>
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={hasStoryPermission}
            onChange={(e) => setHasStoryPermission(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C]"
          />
          <span>
            I grant Agape Communion Church permission to review and publish this
            testimony on the church website.
          </span>
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={hasMediaPermission}
            onChange={(e) => setHasMediaPermission(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C]"
          />
          <span>
            I confirm permission for an approved church or personal photograph
            to accompany this testimony.
          </span>
        </label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Testimony for Review"}
      </Button>
    </form>
  );
}

