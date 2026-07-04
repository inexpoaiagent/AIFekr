-- Real TEAM-plan model: a Team owns a pooled credit balance; up to
-- maxSeats Users join it as TeamMember rows (including the owner, so
-- credit-deduction logic can treat every seat identically). Invites are
-- redeemed via a one-time token in TeamInvite.

CREATE TABLE IF NOT EXISTS "Team" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "name"       TEXT NOT NULL,
    "ownerId"    TEXT NOT NULL,
    "credits"    INTEGER NOT NULL DEFAULT 0,
    "planExpiry" DATETIME,
    "maxSeats"   INTEGER NOT NULL DEFAULT 5,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL,
    CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Team_ownerId_key" ON "Team"("ownerId");

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id"       TEXT NOT NULL PRIMARY KEY,
    "teamId"   TEXT NOT NULL,
    "userId"   TEXT NOT NULL,
    "role"     TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_userId_key" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");

CREATE TABLE IF NOT EXISTS "TeamInvite" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "teamId"    TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamInvite_token_key" ON "TeamInvite"("token");
CREATE INDEX IF NOT EXISTS "TeamInvite_teamId_idx" ON "TeamInvite"("teamId");
CREATE INDEX IF NOT EXISTS "TeamInvite_email_idx" ON "TeamInvite"("email");
