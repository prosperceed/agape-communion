import { publicEnv } from "./env";

export const siteConfig = {
  name: publicEnv.NEXT_PUBLIC_SITE_NAME,
  shortName: "Agape Communion",
  tagline: "Growing in Grace, Rooted in Truth, Serving in Love",
  description:
    "Agape Communion Church is a Christ-centered church community in Lagos, Nigeria dedicated to sound biblical teaching, fervent prayer, and compassionate community service.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  defaultAddress: "Plot 24 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
  defaultPhone: "+234 (0) 803 456 7890",
  defaultEmail: "hello@agapecommunion.org.ng",
  logo: "/assets/branding/logo.svg",
  logoLight: "/assets/branding/logo-light.svg",
  socialLinks: {
    youtube: "https://youtube.com/@agapecommunionchurch",
    facebook: "https://facebook.com/agapecommunionchurch",
    instagram: "https://instagram.com/agapecommunionchurch",
  },
} as const;
