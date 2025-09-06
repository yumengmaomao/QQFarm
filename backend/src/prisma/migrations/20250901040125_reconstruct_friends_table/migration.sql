/*
  Warnings:

  - The primary key for the `Friendship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `friendId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `addresseeId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Friendship_friendId_idx` ON `Friendship`;

-- AlterTable
ALTER TABLE `Friendship` DROP PRIMARY KEY,
    DROP COLUMN `friendId`,
    DROP COLUMN `userId`,
    ADD COLUMN `addresseeId` INTEGER NOT NULL,
    ADD COLUMN `requesterId` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`requesterId`, `addresseeId`);

-- CreateIndex
CREATE INDEX `Friendship_addresseeId_idx` ON `Friendship`(`addresseeId`);
