-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "pdf_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT,
    "summaryText" TEXT,
    "status" "SummaryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pdf_summaries_userId_idx" ON "pdf_summaries"("userId");

-- AddForeignKey
ALTER TABLE "pdf_summaries" ADD CONSTRAINT "pdf_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
