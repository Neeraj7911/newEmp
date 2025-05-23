/*
  Warnings:

  - You are about to drop the column `location` on the `attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `location`,
    ADD COLUMN `checkInLocation` VARCHAR(191) NULL,
    ADD COLUMN `checkOutLocation` VARCHAR(191) NULL;
