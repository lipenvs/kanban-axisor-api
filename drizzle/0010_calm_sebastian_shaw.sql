ALTER TABLE "task" DROP CONSTRAINT "task_label_id_label_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "label_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE set null ON UPDATE no action;