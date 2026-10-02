/*
  Warnings:

  - Added the required column `userId` to the `DataPenimbangan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataPenimbangan" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DataPenimbangan" ADD CONSTRAINT "DataPenimbangan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
