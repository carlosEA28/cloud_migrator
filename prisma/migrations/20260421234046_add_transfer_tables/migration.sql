-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX');

-- CreateEnum
CREATE TYPE "TransferSessionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FileTransferStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TransferLogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_connection" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "oauth_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_session" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceConnId" UUID NOT NULL,
    "destConnId" UUID NOT NULL,
    "status" "TransferSessionStatus" NOT NULL,
    "totalFiles" INTEGER NOT NULL,
    "completedFiles" INTEGER NOT NULL,
    "failedFiles" INTEGER NOT NULL,
    "totalBytes" BIGINT NOT NULL,
    "transferredBytes" BIGINT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transfer_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_transfer" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" BIGINT NOT NULL,
    "mimeType" TEXT,
    "checksum" TEXT,
    "status" "FileTransferStatus" NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "bullJobId" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "file_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_log" (
    "id" UUID NOT NULL,
    "fileTransferId" UUID NOT NULL,
    "level" "TransferLogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "oauth_connection_userId_idx" ON "oauth_connection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connection_userId_provider_key" ON "oauth_connection"("userId", "provider");

-- CreateIndex
CREATE INDEX "transfer_session_userId_idx" ON "transfer_session"("userId");

-- CreateIndex
CREATE INDEX "transfer_session_sourceConnId_idx" ON "transfer_session"("sourceConnId");

-- CreateIndex
CREATE INDEX "transfer_session_destConnId_idx" ON "transfer_session"("destConnId");

-- CreateIndex
CREATE INDEX "file_transfer_sessionId_idx" ON "file_transfer"("sessionId");

-- CreateIndex
CREATE INDEX "file_transfer_status_idx" ON "file_transfer"("status");

-- CreateIndex
CREATE INDEX "transfer_log_fileTransferId_idx" ON "transfer_log"("fileTransferId");

-- CreateIndex
CREATE INDEX "transfer_log_occurredAt_idx" ON "transfer_log"("occurredAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_connection" ADD CONSTRAINT "oauth_connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_session" ADD CONSTRAINT "transfer_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_session" ADD CONSTRAINT "transfer_session_sourceConnId_fkey" FOREIGN KEY ("sourceConnId") REFERENCES "oauth_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_session" ADD CONSTRAINT "transfer_session_destConnId_fkey" FOREIGN KEY ("destConnId") REFERENCES "oauth_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_transfer" ADD CONSTRAINT "file_transfer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "transfer_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_log" ADD CONSTRAINT "transfer_log_fileTransferId_fkey" FOREIGN KEY ("fileTransferId") REFERENCES "file_transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
