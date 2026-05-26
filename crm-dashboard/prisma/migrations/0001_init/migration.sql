CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "assignee" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "tagsRaw" TEXT NOT NULL,
    "content" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DealTag" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "DealTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "DealTag_tag_idx" ON "DealTag"("tag");
CREATE INDEX "DealTag_dealId_idx" ON "DealTag"("dealId");

ALTER TABLE "DealTag" ADD CONSTRAINT "DealTag_dealId_fkey" 
    FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
