CREATE TABLE IF NOT EXISTS "itemsImages" (
	"id" text PRIMARY KEY NOT NULL,
	"case_number" text NOT NULL,
	"images_path" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "foreclosure" ALTER COLUMN "square_meter" SET DATA TYPE real;