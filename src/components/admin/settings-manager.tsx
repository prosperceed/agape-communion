"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { updateChurchSettingsAction } from "@/features/pages/actions";
import type { ChurchSettingsData } from "@/features/pages/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { toast } from "@/components/ui/toast";

export function SettingsManager({
  initialSettings,
}: {
  initialSettings: ChurchSettingsData;
}) {
  const router = useRouter();
  const [churchName, setChurchName] = React.useState(
    initialSettings.churchName
  );
  const [tagline, setTagline] = React.useState(initialSettings.tagline);
  const [logoUrl, setLogoUrl] = React.useState(initialSettings.logoUrl);
  const [address, setAddress] = React.useState(initialSettings.address);
  const [phone, setPhone] = React.useState(initialSettings.phone);
  const [email, setEmail] = React.useState(initialSettings.email);
  const [vision, setVision] = React.useState(initialSettings.vision);
  const [mission, setMission] = React.useState(initialSettings.mission);
  const [aboutIntro, setAboutIntro] = React.useState(
    initialSettings.aboutIntro
  );
  const [aboutBackground, setAboutBackground] = React.useState(
    initialSettings.aboutBackground
  );
  const [serviceSummary, setServiceSummary] = React.useState(
    initialSettings.serviceSummary
  );
  const [mapLink, setMapLink] = React.useState(initialSettings.mapLink);
  const [youtubeUrl, setYoutubeUrl] = React.useState(
    initialSettings.youtubeUrl
  );
  const [facebookUrl, setFacebookUrl] = React.useState(
    initialSettings.facebookUrl
  );
  const [instagramUrl, setInstagramUrl] = React.useState(
    initialSettings.instagramUrl
  );
  const [livestreamDefaultSchedule, setLivestreamDefaultSchedule] =
    React.useState(initialSettings.livestreamDefaultSchedule);

  const [coreBeliefs, setCoreBeliefs] = React.useState(
    initialSettings.coreBeliefs
  );
  const [leadership, setLeadership] = React.useState(
    initialSettings.leadership
  );

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setIsPending(true);

    try {
      const res = await updateChurchSettingsAction({
        churchName,
        tagline,
        logoUrl,
        address,
        phone,
        email,
        vision,
        mission,
        aboutIntro,
        aboutBackground,
        coreBeliefs,
        leadership,
        serviceSummary,
        mapLink,
        youtubeUrl,
        facebookUrl,
        instagramUrl,
        livestreamDefaultSchedule,
      });

      if (res.success) {
        toast.success(res.message || "Church settings updated successfully.");
        setFeedback({
          type: "success",
          text: res.message || "Church settings saved.",
        });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update church settings.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Super Admin Governance
        </div>
        <h1 className="mt-2 font-serif text-2xl font-bold text-slate-900">
          Church Identity & Global Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure official contact details, About page sections, core beliefs, leadership profiles, and social channels.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity & Contact */}
        <div className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="border-b border-slate-100 pb-3 font-serif text-lg font-bold text-slate-900">
            General Identity & Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="settings-church-name">Church Name</Label>
              <Input
                id="settings-church-name"
                required
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-tagline">Header Tagline</Label>
              <Input
                id="settings-tagline"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-phone">Official Phone Number</Label>
              <Input
                id="settings-phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-email">Official Email Address</Label>
              <Input
                id="settings-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="settings-address">Sanctuary Address</Label>
              <Input
                id="settings-address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-service-summary">
                Service Times Summary
              </Label>
              <Input
                id="settings-service-summary"
                required
                value={serviceSummary}
                onChange={(e) => setServiceSummary(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-livestream-schedule">
                Default Livestream Schedule Banner Text
              </Label>
              <Input
                id="settings-livestream-schedule"
                required
                value={livestreamDefaultSchedule}
                onChange={(e) => setLivestreamDefaultSchedule(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-logo-url">Logo Path</Label>
              <Input
                id="settings-logo-url"
                required
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-map-link">Google Maps Link URL</Label>
              <Input
                id="settings-map-link"
                type="url"
                required
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Vision, Mission & About */}
        <div className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="border-b border-slate-100 pb-3 font-serif text-lg font-bold text-slate-900">
            About Us, Vision & Mission
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="settings-vision">Our Vision</Label>
              <Textarea
                id="settings-vision"
                rows={4}
                required
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-mission">Our Mission</Label>
              <Textarea
                id="settings-mission"
                rows={4}
                required
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="settings-about-intro">
                About Page Introduction
              </Label>
              <Textarea
                id="settings-about-intro"
                rows={3}
                required
                value={aboutIntro}
                onChange={(e) => setAboutIntro(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="settings-about-background">
                Church Background & Story
              </Label>
              <Textarea
                id="settings-about-background"
                rows={5}
                required
                value={aboutBackground}
                onChange={(e) => setAboutBackground(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Core Beliefs */}
        <div className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Core Beliefs
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setCoreBeliefs([
                  ...coreBeliefs,
                  {
                    title: "New Core Belief",
                    description:
                      "Summarize this foundational doctrine clearly.",
                    scripture: "John 3:16",
                  },
                ])
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Belief
            </Button>
          </div>

          <div className="space-y-4">
            {coreBeliefs.map((belief, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label>Doctrine Title</Label>
                    <Input
                      required
                      value={belief.title}
                      onChange={(e) => {
                        const next = [...coreBeliefs];
                        next[index] = { ...belief, title: e.target.value };
                        setCoreBeliefs(next);
                      }}
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Scripture Reference</Label>
                      <Input
                        required
                        value={belief.scripture}
                        onChange={(e) => {
                          const next = [...coreBeliefs];
                          next[index] = {
                            ...belief,
                            scripture: e.target.value,
                          };
                          setCoreBeliefs(next);
                        }}
                        className="mt-1 bg-white"
                      />
                    </div>
                    {coreBeliefs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() =>
                          setCoreBeliefs(
                            coreBeliefs.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <Label>Explanation</Label>
                    <Textarea
                      rows={2}
                      required
                      value={belief.description}
                      onChange={(e) => {
                        const next = [...coreBeliefs];
                        next[index] = {
                          ...belief,
                          description: e.target.value,
                        };
                        setCoreBeliefs(next);
                      }}
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Church Leadership Profiles
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setLeadership([
                  ...leadership,
                  {
                    name: "Pastor Name",
                    role: "Associate Pastor",
                    bio: "Dedicated to teaching the Word and caring for families.",
                    imageUrl: "/assets/leadership/senior-pastor.jpg",
                  },
                ])
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Leader
            </Button>
          </div>

          <div className="space-y-4">
            {leadership.map((leader, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={leader.name}
                      onChange={(e) => {
                        const next = [...leadership];
                        next[index] = { ...leader, name: e.target.value };
                        setLeadership(next);
                      }}
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Ministry Role</Label>
                      <Input
                        required
                        value={leader.role}
                        onChange={(e) => {
                          const next = [...leadership];
                          next[index] = { ...leader, role: e.target.value };
                          setLeadership(next);
                        }}
                        className="mt-1 bg-white"
                      />
                    </div>
                    {leadership.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() =>
                          setLeadership(
                            leadership.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Biography</Label>
                    <Textarea
                      rows={2}
                      required
                      value={leader.bio}
                      onChange={(e) => {
                        const next = [...leadership];
                        next[index] = { ...leader, bio: e.target.value };
                        setLeadership(next);
                      }}
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1.5 block">Portrait Photo</Label>
                    <AssetImageSelector
                      value={leader.imageUrl}
                      onChange={(val) => {
                        const next = [...leadership];
                        next[index] = { ...leader, imageUrl: val };
                        setLeadership(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="border-b border-slate-100 pb-3 font-serif text-lg font-bold text-slate-900">
            Social Media Channels
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="settings-youtube">YouTube Channel URL</Label>
              <Input
                id="settings-youtube"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-facebook">Facebook Page URL</Label>
              <Input
                id="settings-facebook"
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-instagram">Instagram Profile URL</Label>
              <Input
                id="settings-instagram"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            <Save className="mr-1.5 h-4 w-4" />
            {isPending ? "Saving Changes..." : "Save Church Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
