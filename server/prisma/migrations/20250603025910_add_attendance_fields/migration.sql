-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `isEmergency` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `violationCount` INTEGER NOT NULL DEFAULT 0;
