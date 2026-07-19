ALTER TABLE "Prompt" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Prompt" ADD COLUMN "contentEn" TEXT;
ALTER TABLE "Prompt" ADD COLUMN "toolType" TEXT NOT NULL DEFAULT 'chat';
ALTER TABLE "Prompt" ADD COLUMN "thumbnailUrl" TEXT;
CREATE INDEX "Prompt_toolType_isActive_idx" ON "Prompt"("toolType", "isActive");

ALTER TABLE "GeneratedImage" ADD COLUMN "sourceImageUrl" TEXT;
ALTER TABLE "GeneratedVideo" ADD COLUMN "sourceImageUrl" TEXT;
