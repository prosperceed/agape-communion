CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'INVITED', 'DEACTIVATED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('SUPER_ADMIN', 'EDITOR_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');--> statement-breakpoint
CREATE TYPE "public"."livestream_platform" AS ENUM('YOUTUBE', 'FACEBOOK');--> statement-breakpoint
CREATE TYPE "public"."livestream_status" AS ENUM('SCHEDULED', 'LIVE', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."service_frequency" AS ENUM('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ONE_TIME');--> statement-breakpoint
CREATE TYPE "public"."testimony_status" AS ENUM('PENDING', 'APPROVED', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "admin_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_name" varchar(160) NOT NULL,
	"actor_role" "admin_role" NOT NULL,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(120),
	"summary" text NOT NULL,
	"metadata_json" text,
	"ip_address" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"scope" varchar(50) DEFAULT 'BLOG' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(60),
	"subject" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devotionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"scripture_reference" varchar(180) NOT NULL,
	"bible_passage" text NOT NULL,
	"content" text NOT NULL,
	"reflection_prompt" text NOT NULL,
	"cover_image" text NOT NULL,
	"author_name" varchar(150) NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"excerpt" text NOT NULL,
	"description" text NOT NULL,
	"cover_image" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"venue" varchar(255) NOT NULL,
	"registration_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestreams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"description" text NOT NULL,
	"platform" "livestream_platform" DEFAULT 'YOUTUBE' NOT NULL,
	"stream_url" text NOT NULL,
	"embed_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"status" "livestream_status" DEFAULT 'SCHEDULED' NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"object_key" varchar(500) NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" varchar(255) NOT NULL,
	"folder" varchar(80) DEFAULT 'general' NOT NULL,
	"uploaded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"speaker" varchar(160) NOT NULL,
	"series_name" varchar(160),
	"description" text NOT NULL,
	"scripture_references" varchar(255) NOT NULL,
	"date_preached" timestamp with time zone NOT NULL,
	"thumbnail_url" text NOT NULL,
	"video_url" text,
	"audio_url" text,
	"category_id" uuid,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image" text NOT NULL,
	"category_id" uuid,
	"author_id" uuid,
	"author_name" varchar(150) NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" varchar(30) NOT NULL,
	"end_time" varchar(30) NOT NULL,
	"frequency" "service_frequency" DEFAULT 'WEEKLY' NOT NULL,
	"notes" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(255),
	"image_url" text,
	"is_recurring" boolean DEFAULT true NOT NULL,
	"event_date" timestamp with time zone,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_name" varchar(200) NOT NULL,
	"tagline" varchar(255) NOT NULL,
	"logo_url" text NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(80) NOT NULL,
	"email" varchar(160) NOT NULL,
	"vision" text NOT NULL,
	"mission" text NOT NULL,
	"about_intro" text NOT NULL,
	"about_background" text NOT NULL,
	"core_beliefs_json" text NOT NULL,
	"leadership_json" text NOT NULL,
	"service_summary" text NOT NULL,
	"map_link" text NOT NULL,
	"youtube_url" text,
	"facebook_url" text,
	"instagram_url" text,
	"livestream_default_schedule" varchar(255) NOT NULL,
	"updated_by_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"person_name" varchar(160) NOT NULL,
	"display_person_name" boolean DEFAULT true NOT NULL,
	"has_media_permission" boolean DEFAULT false NOT NULL,
	"has_story_permission" boolean DEFAULT false NOT NULL,
	"role_or_relation" varchar(120),
	"excerpt" text NOT NULL,
	"full_testimony" text NOT NULL,
	"image_url" text NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "testimony_status" DEFAULT 'PENDING' NOT NULL,
	"approved_by_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'EDITOR_ADMIN' NOT NULL,
	"status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"invitation_token" varchar(255),
	"invitation_expires_at" timestamp with time zone,
	"invited_by_id" uuid,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotionals" ADD CONSTRAINT "devotionals_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestreams" ADD CONSTRAINT "livestreams_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_schedules" ADD CONSTRAINT "service_schedules_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_logs_created_idx" ON "admin_activity_logs" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "admin_logs_actor_idx" ON "admin_activity_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "admin_logs_entity_idx" ON "admin_activity_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_scope_idx" ON "categories" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "contact_submissions_read_created_idx" ON "contact_submissions" USING btree ("is_read","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "devotionals_slug_idx" ON "devotionals" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "devotionals_status_published_idx" ON "devotionals" USING btree ("status","published_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_status_start_date_idx" ON "events" USING btree ("status","start_date","id");--> statement-breakpoint
CREATE UNIQUE INDEX "livestreams_slug_idx" ON "livestreams" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "livestreams_status_scheduled_idx" ON "livestreams" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "media_object_key_idx" ON "media" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "media_folder_created_idx" ON "media" USING btree ("folder","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_slug_idx" ON "messages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "messages_status_date_idx" ON "messages" USING btree ("status","date_preached","id");--> statement-breakpoint
CREATE INDEX "post_tags_tag_idx" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_published_idx" ON "posts" USING btree ("status","published_at","id");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "service_schedules_service_idx" ON "service_schedules" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_schedules_day_time_idx" ON "service_schedules" USING btree ("day_of_week","start_time");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_status_order_idx" ON "services" USING btree ("status","display_order","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "testimonies_slug_idx" ON "testimonies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "testimonies_status_featured_idx" ON "testimonies" USING btree ("status","is_featured","published_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_status_idx" ON "users" USING btree ("role","status");