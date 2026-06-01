-- CreateEnum
CREATE TYPE "PackageFormSource" AS ENUM ('PUBLIC', 'CUSTOMER_PORTAL');

-- CreateTable
CREATE TABLE "package_forms" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Haiti',
    "packageCount" INTEGER NOT NULL DEFAULT 1,
    "trackingNumbers" JSONB NOT NULL,
    "packageDescription" TEXT,
    "notes" TEXT,
    "signatureDataUrl" TEXT NOT NULL,
    "source" "PackageFormSource" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_forms_email_idx" ON "package_forms"("email");

-- CreateIndex
CREATE INDEX "package_forms_createdAt_idx" ON "package_forms"("createdAt");

-- AddForeignKey
ALTER TABLE "package_forms" ADD CONSTRAINT "package_forms_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
