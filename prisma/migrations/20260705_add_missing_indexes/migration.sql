-- Adds missing indexes on foreign-key / frequently-filtered columns that
-- were never indexed, plus a uniqueness guard on Payment.authority as a
-- defense-in-depth against double-crediting the same ZarinPal payment
-- (the app already guards this with a status-check, this is a DB-level
-- backstop). All statements are additive and idempotent — safe to run
-- against a database that already has some or all of these.

CREATE INDEX IF NOT EXISTS "Conversation_userId_idx" ON "Conversation"("userId");
CREATE INDEX IF NOT EXISTS "Conversation_projectId_idx" ON "Conversation"("projectId");

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");

CREATE INDEX IF NOT EXISTS "GeneratedImage_userId_idx" ON "GeneratedImage"("userId");
CREATE INDEX IF NOT EXISTS "GeneratedVideo_userId_idx" ON "GeneratedVideo"("userId");
CREATE INDEX IF NOT EXISTS "GeneratedMusic_userId_idx" ON "GeneratedMusic"("userId");

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_authority_key" ON "Payment"("authority");

CREATE INDEX IF NOT EXISTS "UsageLog_userId_idx" ON "UsageLog"("userId");
CREATE INDEX IF NOT EXISTS "UsageLog_createdAt_idx" ON "UsageLog"("createdAt");

CREATE INDEX IF NOT EXISTS "OtpCode_phone_idx" ON "OtpCode"("phone");

CREATE INDEX IF NOT EXISTS "CrmContact_userId_idx" ON "CrmContact"("userId");
CREATE INDEX IF NOT EXISTS "CrmContact_status_idx" ON "CrmContact"("status");

CREATE INDEX IF NOT EXISTS "BusinessAnalysis_userId_idx" ON "BusinessAnalysis"("userId");
CREATE INDEX IF NOT EXISTS "SocialPost_userId_idx" ON "SocialPost"("userId");
CREATE INDEX IF NOT EXISTS "GeneratedWebsite_userId_idx" ON "GeneratedWebsite"("userId");

CREATE INDEX IF NOT EXISTS "Company_industryPackId_idx" ON "Company"("industryPackId");
CREATE INDEX IF NOT EXISTS "Company_categoryId_idx" ON "Company"("categoryId");

CREATE INDEX IF NOT EXISTS "User_industryPackId_idx" ON "User"("industryPackId");

CREATE INDEX IF NOT EXISTS "ProviderFallbackLog_createdAt_idx" ON "ProviderFallbackLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ProviderFallbackLog_fromProvider_idx" ON "ProviderFallbackLog"("fromProvider");
