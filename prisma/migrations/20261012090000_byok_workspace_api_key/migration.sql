-- Bring your own key: plans, limits and Stripe are gone, and each workspace
-- answers with its own Anthropic key instead.

-- DropTable
DROP TABLE "subscription";

-- CreateTable
CREATE TABLE "workspaceApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'anthropic',
    "ciphertext" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'valid',
    "lastVerifiedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaceApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaceApiKey_organizationId_key" ON "workspaceApiKey"("organizationId");
