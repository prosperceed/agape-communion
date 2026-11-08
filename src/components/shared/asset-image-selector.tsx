"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AVAILABLE_PUBLIC_ASSETS = [
  {
    label: "Worship Sanctuary (Hero)",
    url: "/assets/hero/worship-sanctuary.jpg",
  },
  {
    label: "Sunday Livestream Banner",
    url: "/assets/hero/sunday-livestream-banner.jpg",
  },
  {
    label: "Congregation Worship",
    url: "/assets/church/congregation-worship.jpg",
  },
  {
    label: "Community Fellowship",
    url: "/assets/church/community-fellowship.jpg",
  },
  {
    label: "Sanctuary Intercession",
    url: "/assets/church/sanctuary-intercession.jpg",
  },
  {
    label: "Sunday Communion Service",
    url: "/assets/services/sunday-communion-service.jpg",
  },
  {
    label: "Midweek Bible Study",
    url: "/assets/services/midweek-bible-study.jpg",
  },
  {
    label: "Friday Prayer Vigil",
    url: "/assets/services/friday-prayer-vigil.jpg",
  },
  {
    label: "Youth Fellowship",
    url: "/assets/services/youth-fellowship.jpg",
  },
  {
    label: "Night of Worship Event",
    url: "/assets/events/night-of-worship.jpg",
  },
  {
    label: "Youth Fire Conference",
    url: "/assets/events/youth-fire-conference.jpg",
  },
  {
    label: "Community Love Outreach",
    url: "/assets/events/community-love-outreach.jpg",
  },
  {
    label: "Renewing Your Mind (Message)",
    url: "/assets/messages/renewing-your-mind.jpg",
  },
  {
    label: "Having Faith When Life Is Hard (Message)",
    url: "/assets/messages/having-faith-when-life-is-hard.jpg",
  },
  {
    label: "The Hope of His Calling (Message)",
    url: "/assets/messages/the-hope-of-his-calling.jpg",
  },
  {
    label: "God Our Refuge and Strength (Message)",
    url: "/assets/messages/god-our-refuge-and-strength.jpg",
  },
  {
    label: "Abiding in the Living Word (Blog)",
    url: "/assets/blog/abiding-in-the-living-word.jpg",
  },
  {
    label: "The Power of Christian Communion (Blog)",
    url: "/assets/blog/the-power-of-christian-communion.jpg",
  },
  {
    label: "Cultivating a Life of Secret Prayer (Blog)",
    url: "/assets/blog/cultivating-a-life-of-secret-prayer.jpg",
  },
  {
    label: "Finding Peace in the Psalms (Blog)",
    url: "/assets/blog/finding-peace-in-the-psalms.jpg",
  },
  {
    label: "Deacon Chinedu Obi (Testimony)",
    url: "/assets/testimonies/deacon-chinedu-obi.jpg",
  },
  {
    label: "Brother Tunde Bakare (Testimony)",
    url: "/assets/testimonies/brother-tunde-bakare.jpg",
  },
  {
    label: "Sister Blessing Eze (Testimony)",
    url: "/assets/testimonies/sister-blessing-eze.jpg",
  },
] as const;

interface AssetImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  id?: string;
}

export function AssetImageSelector({
  value,
  onChange,
  id,
}: AssetImageSelectorProps) {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/..."
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowGallery((prev) => !prev)}
        >
          <ImageIcon className="h-4 w-4" />
          Browse Media
        </Button>
      </div>

      {showGallery && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-sm border border-slate-200 bg-slate-50 p-3 max-h-64 overflow-y-auto">
          {AVAILABLE_PUBLIC_ASSETS.map((asset) => {
            const isSelected = value === asset.url;
            return (
              <button
                key={asset.url}
                type="button"
                onClick={() => {
                  onChange(asset.url);
                  setShowGallery(false);
                }}
                className={`group relative rounded-sm overflow-hidden border text-left transition-all ${
                  isSelected
                    ? "border-[#EA580C] ring-2 ring-[#EA580C]"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="relative aspect-[16/10] w-full bg-slate-200">
                  <Image
                    src={asset.url}
                    alt={asset.label}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#EA580C] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="p-1.5 bg-white">
                  <p className="truncate text-[11px] font-medium text-slate-700">
                    {asset.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

