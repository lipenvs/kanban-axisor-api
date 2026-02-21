ALTER TABLE "attachment" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."attachment_status";--> statement-breakpoint
CREATE TYPE "public"."attachment_status" AS ENUM('pending', 'scanning', 'clean', 'infected');--> statement-breakpoint
UPDATE "attachment" SET "status" = 'infected' WHERE "status" = 'error';--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."attachment_status";--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "status" SET DATA TYPE "public"."attachment_status" USING "status"::"public"."attachment_status";