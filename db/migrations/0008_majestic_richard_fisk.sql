CREATE TABLE IF NOT EXISTS "shouldbuy" (
	"id" text PRIMARY KEY NOT NULL,
	"case_number" text NOT NULL,
	"type" text NOT NULL,
	"court" text NOT NULL,
	"year" integer NOT NULL,
	"zhcode" text NOT NULL,
	"stock" text NOT NULL,
	"bid_date" timestamp NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"full_address" text NOT NULL,
	"ratio" text NOT NULL,
	"ping" integer NOT NULL,
	"square_meter" real NOT NULL,
	"base_price" bigint NOT NULL,
	"total_base_price" bigint NOT NULL,
	"handover" text NOT NULL,
	"empty" text NOT NULL,
	"is_unregistered_building" boolean NOT NULL,
	"marking" text NOT NULL,
	"remark" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "foreclosure" ALTER COLUMN "is_unregistered_building" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "foreclosure" ALTER COLUMN "remark" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemsImages" ALTER COLUMN "images_path" DROP DEFAULT;