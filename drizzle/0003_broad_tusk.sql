ALTER TABLE "task" ALTER COLUMN "order" SET DATA TYPE real USING "order"::real;
ALTER TABLE "column" ALTER COLUMN "order" SET DATA TYPE real USING "order"::real;