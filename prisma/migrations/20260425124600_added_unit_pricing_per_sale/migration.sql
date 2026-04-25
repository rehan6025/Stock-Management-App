/*
  Warnings:

  - Added the required column `unitPrice` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
