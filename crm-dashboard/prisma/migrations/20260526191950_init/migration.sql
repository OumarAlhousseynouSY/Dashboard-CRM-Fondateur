-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateCreated" DATETIME,
    "dueDate" DATETIME,
    "startDate" DATETIME,
    "assignee" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "tagsRaw" TEXT NOT NULL,
    "content" TEXT,
    "amount" REAL NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DealTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "DealTag_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DealTag_tag_idx" ON "DealTag"("tag");

-- CreateIndex
CREATE INDEX "DealTag_dealId_idx" ON "DealTag"("dealId");
