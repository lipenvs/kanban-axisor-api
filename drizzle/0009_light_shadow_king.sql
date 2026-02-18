ALTER TABLE "task" ALTER COLUMN "order" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "order" SET DEFAULT 10000;--> statement-breakpoint
ALTER TABLE "column" ALTER COLUMN "order" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "column" ALTER COLUMN "order" SET DEFAULT 10000;