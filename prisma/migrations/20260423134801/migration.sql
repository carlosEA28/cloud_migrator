/*
  Warnings:

  - Changed the type of `provider` on the `oauth_connection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "oauth_connection" DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connection_userId_provider_key" ON "oauth_connection"("userId", "provider");
