-- Add staff role and order lifecycle timing fields for queue/ETA tracking.
ALTER TABLE "user" ADD COLUMN "isStaff" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Order" ADD COLUMN "preparingAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "readyAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "pickedUpAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "estimatedReadyAt" DATETIME;
