ALTER TABLE "bidprice" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bidprice" ALTER COLUMN "price_diff" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "foreclosure" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shouldbuy" ALTER COLUMN "city" DROP NOT NULL;