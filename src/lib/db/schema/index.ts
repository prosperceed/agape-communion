import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "SUPER_ADMIN",
  "EDITOR_ADMIN",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "ACTIVE",
  "INVITED",
  "DEACTIVATED",
  "REVOKED",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const testimonyStatusEnum = pgEnum("testimony_status", [
  "PENDING",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const livestreamStatusEnum = pgEnum("livestream_status", [
  "SCHEDULED",
  "LIVE",
  "ENDED",
]);

export const livestreamPlatformEnum = pgEnum("livestream_platform", [
  "YOUTUBE",
  "FACEBOOK",
]);

export const serviceFrequencyEnum = pgEnum("service_frequency", [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "ONE_TIME",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: adminRoleEnum("role").notNull().default("EDITOR_ADMIN"),
    status: accountStatusEnum("status").notNull().default("ACTIVE"),
    invitationToken: varchar("invitation_token", { length: 255 }),
    invitationExpiresAt: timestamp("invitation_expires_at", { withTimezone: true }),
    invitedById: uuid("invited_by_id"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_status_idx").on(table.role, table.status),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    scope: varchar("scope", { length: 50 }).notNull().default("BLOG"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_scope_idx").on(table.scope),
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)]
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description").notNull(),
    location: varchar("location", { length: 255 }),
    imageUrl: text("image_url"),
    isRecurring: boolean("is_recurring").notNull().default(true),
    eventDate: timestamp("event_date", { withTimezone: true }),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    displayOrder: integer("display_order").notNull().default(0),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("services_slug_idx").on(table.slug),
    index("services_status_order_idx").on(table.status, table.displayOrder, table.createdAt),
  ]
);

export const serviceSchedules = pgTable(
  "service_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
    startTime: varchar("start_time", { length: 30 }).notNull(),
    endTime: varchar("end_time", { length: 30 }).notNull(),
    frequency: serviceFrequencyEnum("frequency").notNull().default("WEEKLY"),
    notes: varchar("notes", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("service_schedules_service_idx").on(table.serviceId),
    index("service_schedules_day_time_idx").on(table.dayOfWeek, table.startTime),
  ]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    excerpt: text("excerpt").notNull(),
    description: text("description").notNull(),
    coverImage: text("cover_image").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    venue: varchar("venue", { length: 255 }).notNull(),
    registrationUrl: text("registration_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("events_slug_idx").on(table.slug),
    index("events_status_start_date_idx").on(table.status, table.startDate, table.id),
  ]
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 260 }).notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    coverImage: text("cover_image").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    authorName: varchar("author_name", { length: 150 }).notNull(),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("posts_slug_idx").on(table.slug),
    index("posts_status_published_idx").on(table.status, table.publishedAt, table.id),
    index("posts_category_idx").on(table.categoryId),
  ]
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_idx").on(table.tagId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 260 }).notNull(),
    speaker: varchar("speaker", { length: 160 }).notNull(),
    seriesName: varchar("series_name", { length: 160 }),
    description: text("description").notNull(),
    scriptureReferences: varchar("scripture_references", { length: 255 }).notNull(),
    datePreached: timestamp("date_preached", { withTimezone: true }).notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    videoUrl: text("video_url"),
    audioUrl: text("audio_url"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("messages_slug_idx").on(table.slug),
    index("messages_status_date_idx").on(table.status, table.datePreached, table.id),
  ]
);

export const devotionals = pgTable(
  "devotionals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 260 }).notNull(),
    scriptureReference: varchar("scripture_reference", { length: 180 }).notNull(),
    biblePassage: text("bible_passage").notNull(),
    content: text("content").notNull(),
    reflectionPrompt: text("reflection_prompt").notNull(),
    coverImage: text("cover_image").notNull(),
    authorName: varchar("author_name", { length: 150 }).notNull(),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("devotionals_slug_idx").on(table.slug),
    index("devotionals_status_published_idx").on(table.status, table.publishedAt, table.id),
  ]
);

export const testimonies = pgTable(
  "testimonies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    personName: varchar("person_name", { length: 160 }).notNull(),
    displayPersonName: boolean("display_person_name").notNull().default(true),
    hasMediaPermission: boolean("has_media_permission").notNull().default(false),
    hasStoryPermission: boolean("has_story_permission").notNull().default(false),
    roleOrRelation: varchar("role_or_relation", { length: 120 }),
    excerpt: text("excerpt").notNull(),
    fullTestimony: text("full_testimony").notNull(),
    imageUrl: text("image_url").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    status: testimonyStatusEnum("status").notNull().default("PENDING"),
    approvedById: uuid("approved_by_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("testimonies_slug_idx").on(table.slug),
    index("testimonies_status_featured_idx").on(
      table.status,
      table.isFeatured,
      table.publishedAt,
      table.id
    ),
  ]
);

export const livestreams = pgTable(
  "livestreams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 260 }).notNull(),
    description: text("description").notNull(),
    platform: livestreamPlatformEnum("platform").notNull().default("YOUTUBE"),
    streamUrl: text("stream_url").notNull(),
    embedUrl: text("embed_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    status: livestreamStatusEnum("status").notNull().default("SCHEDULED"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    updatedById: uuid("updated_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("livestreams_slug_idx").on(table.slug),
    index("livestreams_status_scheduled_idx").on(table.status, table.scheduledFor),
  ]
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filename: varchar("filename", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    url: text("url").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: varchar("alt_text", { length: 255 }).notNull(),
    folder: varchar("folder", { length: 80 }).notNull().default("general"),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("media_object_key_idx").on(table.objectKey),
    index("media_folder_created_idx").on(table.folder, table.createdAt),
  ]
);

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  churchName: varchar("church_name", { length: 200 }).notNull(),
  tagline: varchar("tagline", { length: 255 }).notNull(),
  logoUrl: text("logo_url").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 80 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  vision: text("vision").notNull(),
  mission: text("mission").notNull(),
  aboutIntro: text("about_intro").notNull(),
  aboutBackground: text("about_background").notNull(),
  coreBeliefsJson: text("core_beliefs_json").notNull(),
  leadershipJson: text("leadership_json").notNull(),
  serviceSummary: text("service_summary").notNull(),
  mapLink: text("map_link").notNull(),
  youtubeUrl: text("youtube_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  livestreamDefaultSchedule: varchar("livestream_default_schedule", { length: 255 }).notNull(),
  updatedById: uuid("updated_by_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 60 }),
    subject: varchar("subject", { length: 200 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("contact_submissions_read_created_idx").on(table.isRead, table.createdAt)]
);

export const adminActivityLogs = pgTable(
  "admin_activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorName: varchar("actor_name", { length: 160 }).notNull(),
    actorRole: adminRoleEnum("actor_role").notNull(),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }),
    summary: text("summary").notNull(),
    metadataJson: text("metadata_json"),
    ipAddress: varchar("ip_address", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("admin_logs_created_idx").on(table.createdAt, table.id),
    index("admin_logs_actor_idx").on(table.actorId),
    index("admin_logs_entity_idx").on(table.entityType),
  ]
);
