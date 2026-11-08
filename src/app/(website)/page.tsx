import { getPublicChurchSettings } from "@/features/pages/queries";
import { getPublishedServices } from "@/features/services/queries";
import { getRecentPublishedMessages } from "@/features/messages/queries";
import { getUpcomingPublishedEvents } from "@/features/events/queries";
import { getLatestPublishedDevotionals } from "@/features/devotionals/queries";
import { getLatestPublishedPosts } from "@/features/blog/queries";
import { getFeaturedPublishedTestimonies } from "@/features/testimonies/queries";
import { getPublicLivestreamOverview } from "@/features/livestream/queries";
import {
  HeroAndLivestreamSection,
  HomeServicesSection,
  HomeMessagesSection,
  HomeAboutVisionSection,
  HomeUpcomingEventsSection,
  HomeDevotionalsAndBlogSection,
  HomeTestimoniesSection,
  HomeContactBannerSection,
} from "@/components/website/homepage-sections";

export default async function HomePage() {
  const [
    settings,
    services,
    messages,
    upcomingEvents,
    devotionals,
    posts,
    testimonies,
    livestreamOverview,
  ] = await Promise.all([
    getPublicChurchSettings(),
    getPublishedServices(),
    getRecentPublishedMessages(3),
    getUpcomingPublishedEvents(3),
    getLatestPublishedDevotionals(3),
    getLatestPublishedPosts(3),
    getFeaturedPublishedTestimonies(3),
    getPublicLivestreamOverview(),
  ]);

  return (
    <div>
      <HeroAndLivestreamSection
        settings={settings}
        activeStream={
          livestreamOverview.activeStream ??
          livestreamOverview.scheduledStreams[0] ??
          null
        }
      />
      <HomeServicesSection services={services} />
      <HomeMessagesSection messages={messages} />
      <HomeAboutVisionSection settings={settings} />
      <HomeUpcomingEventsSection events={upcomingEvents} />
      <HomeDevotionalsAndBlogSection devotionals={devotionals} posts={posts} />
      <HomeTestimoniesSection testimonies={testimonies} />
      <HomeContactBannerSection settings={settings} />
    </div>
  );
}

