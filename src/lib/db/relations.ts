import { relations } from "drizzle-orm";
import {
  users,
  categories,
  tags,
  services,
  serviceSchedules,
  events,
  posts,
  postTags,
  messages,
  devotionals,
  testimonies,
  livestreams,
  media,
  settings,
  adminActivityLogs,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  events: many(events),
  posts: many(posts),
  messages: many(messages),
  devotionals: many(devotionals),
  approvedTestimonies: many(testimonies),
  mediaUploads: many(media),
  activityLogs: many(adminActivityLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
  messages: many(messages),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  author: one(users, {
    fields: [services.authorId],
    references: [users.id],
  }),
  schedules: many(serviceSchedules),
}));

export const serviceSchedulesRelations = relations(serviceSchedules, ({ one }) => ({
  service: one(services, {
    fields: [serviceSchedules.serviceId],
    references: [services.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  author: one(users, {
    fields: [events.authorId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  category: one(categories, {
    fields: [messages.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));

export const devotionalsRelations = relations(devotionals, ({ one }) => ({
  author: one(users, {
    fields: [devotionals.authorId],
    references: [users.id],
  }),
}));

export const testimoniesRelations = relations(testimonies, ({ one }) => ({
  approvedBy: one(users, {
    fields: [testimonies.approvedById],
    references: [users.id],
  }),
}));

export const livestreamsRelations = relations(livestreams, ({ one }) => ({
  updatedBy: one(users, {
    fields: [livestreams.updatedById],
    references: [users.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [media.uploadedById],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [settings.updatedById],
    references: [users.id],
  }),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({ one }) => ({
  actor: one(users, {
    fields: [adminActivityLogs.actorId],
    references: [users.id],
  }),
}));
