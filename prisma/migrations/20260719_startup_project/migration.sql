CREATE TABLE "StartupProject" (
  "id"                 TEXT NOT NULL PRIMARY KEY,
  "userId"             TEXT NOT NULL,
  "name"               TEXT NOT NULL,
  "stage"              TEXT NOT NULL DEFAULT 'idea',
  "ideaData"           TEXT,
  "financialData"      TEXT,
  "proposalData"       TEXT,
  "implementationData" TEXT,
  "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          DATETIME NOT NULL,
  CONSTRAINT "StartupProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "StartupProject_userId_idx" ON "StartupProject"("userId");
