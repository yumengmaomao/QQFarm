-- CreateTable
CREATE TABLE `UserStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `stealCount` INTEGER NOT NULL DEFAULT 0,
    `harvestCount` INTEGER NOT NULL DEFAULT 0,
    `sabotageCount` INTEGER NOT NULL DEFAULT 0,
    `helpCount` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserStats_userId_key`(`userId`),
    INDEX `UserStats_stealCount_idx`(`stealCount`),
    INDEX `UserStats_harvestCount_idx`(`harvestCount`),
    INDEX `UserStats_sabotageCount_idx`(`sabotageCount`),
    INDEX `UserStats_helpCount_idx`(`helpCount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
