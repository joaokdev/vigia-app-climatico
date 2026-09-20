CREATE TYPE "public"."data_nature" AS ENUM('observado', 'previsto', 'simulado', 'oficial');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('email_verification', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('ok', 'degradado', 'indisponivel', 'stale');--> statement-breakpoint
CREATE TYPE "public"."station_type" AS ENUM('meteorologica', 'fluviometrica', 'pluviometrica');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_slug" text NOT NULL,
	"title" text NOT NULL,
	"severity" text NOT NULL,
	"issuing_authority" text NOT NULL,
	"summary" text NOT NULL,
	"source_url" text,
	"issued_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "river_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_slug" text NOT NULL,
	"river_name" text NOT NULL,
	"level_m" double precision,
	"flow_m3s" double precision,
	"station_name" text,
	"attention_level" text DEFAULT 'normal' NOT NULL,
	"source" text NOT NULL,
	"nature" "data_nature" DEFAULT 'observado' NOT NULL,
	"status" "provider_status" DEFAULT 'indisponivel' NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "station_type" NOT NULL,
	"network" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"external_id" text,
	"status" "provider_status" DEFAULT 'indisponivel' NOT NULL,
	"last_report_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"favorite_region_slug" text,
	"temperature_unit" text DEFAULT 'celsius' NOT NULL,
	"wind_unit" text DEFAULT 'kmh' NOT NULL,
	"notify_push" boolean DEFAULT true NOT NULL,
	"notify_email" boolean DEFAULT true NOT NULL,
	"notify_sms" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_slug" text NOT NULL,
	"temperature_c" double precision,
	"feels_like_c" double precision,
	"condition" text,
	"humidity_pct" double precision,
	"wind_speed_kmh" double precision,
	"wind_gust_kmh" double precision,
	"wind_direction_deg" double precision,
	"pressure_hpa" double precision,
	"rain_1h_mm" double precision,
	"rain_24h_mm" double precision,
	"cloud_cover_pct" double precision,
	"source" text NOT NULL,
	"nature" "data_nature" DEFAULT 'observado' NOT NULL,
	"status" "provider_status" DEFAULT 'ok' NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "official_alerts_region_idx" ON "official_alerts" USING btree ("region_slug");--> statement-breakpoint
CREATE INDEX "otp_codes_user_purpose_idx" ON "otp_codes" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "river_readings_region_time_idx" ON "river_readings" USING btree ("region_slug","observed_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stations_region_idx" ON "stations" USING btree ("region_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "weather_readings_region_time_idx" ON "weather_readings" USING btree ("region_slug","observed_at");