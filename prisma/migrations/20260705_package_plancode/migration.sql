-- Add planCode to Package so it can become the single source of truth for
-- general-plan pricing (previously the table was never seeded and had no
-- link back to User.plan).
ALTER TABLE "Package" ADD COLUMN "planCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Package_planCode_key" ON "Package"("planCode");
