/*
  Warnings:

  - You are about to drop the column `vectorId` on the `Chunk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chunk" DROP COLUMN "vectorId",
ADD COLUMN     "chapter" TEXT,
ADD COLUMN     "chapterNumber" INTEGER,
ADD COLUMN     "page" INTEGER;
