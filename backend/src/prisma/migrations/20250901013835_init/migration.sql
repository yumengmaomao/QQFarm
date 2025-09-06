-- CreateTable
CREATE TABLE `UserAuth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `nickName` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserAuth_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `authId` INTEGER NOT NULL,
    `nickName` VARCHAR(255) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `exp` INTEGER NOT NULL DEFAULT 0,
    `gold` BIGINT NOT NULL DEFAULT 1000,
    `premiumCurrency` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_authId_key`(`authId`),
    INDEX `User_authId_idx`(`authId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friendship` (
    `userId` INTEGER NOT NULL,
    `friendId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Friendship_friendId_idx`(`friendId`),
    PRIMARY KEY (`userId`, `friendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `maturityCycleCounter` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Farm_userId_key`(`userId`),
    INDEX `Farm_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandPlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmId` INTEGER NOT NULL,
    `plotIndex` INTEGER NOT NULL,
    `stolenNum` INTEGER NOT NULL DEFAULT 0,
    `maturityCycleId` BIGINT NULL,
    `growthTimeReducedSeconds` INTEGER NOT NULL DEFAULT 0,
    `plantId` INTEGER NULL,
    `plantTime` DATETIME(3) NULL,
    `waterState` INTEGER NOT NULL DEFAULT 0,
    `fertilizerState` INTEGER NOT NULL DEFAULT 0,
    `hasWeeds` BOOLEAN NOT NULL DEFAULT false,
    `hasPests` BOOLEAN NOT NULL DEFAULT false,
    `weedPlacedBy` INTEGER NULL,
    `pestPlacedBy` INTEGER NULL,

    INDEX `LandPlot_farmId_idx`(`farmId`),
    INDEX `LandPlot_plantId_idx`(`plantId`),
    UNIQUE INDEX `LandPlot_farmId_plotIndex_key`(`farmId`, `plotIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StealLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `landPlotId` INTEGER NOT NULL,
    `stealerId` INTEGER NOT NULL,
    `maturityCycleId` BIGINT NOT NULL,
    `stolenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StealLog_landPlotId_idx`(`landPlotId`),
    INDEX `StealLog_stealerId_idx`(`stealerId`),
    UNIQUE INDEX `StealLog_landPlotId_stealerId_maturityCycleId_key`(`landPlotId`, `stealerId`, `maturityCycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyInteraction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `actionType` ENUM('PLOW', 'PLANT', 'WATER', 'FERTILIZE', 'HARVEST', 'BUY', 'SELL', 'UPGRADE', 'WEED', 'PEST', 'HELP_WATER', 'HELP_WEED', 'HELP_PEST', 'STEAL', 'SABOTAGE_WEED', 'SABOTAGE_PEST', 'LOGOUT') NOT NULL,
    `date` DATE NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `DailyInteraction_userId_actionType_date_key`(`userId`, `actionType`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plant` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `image` VARCHAR(255) NULL,
    `requiredLevel` INTEGER NOT NULL,
    `category` VARCHAR(255) NULL,
    `economics` JSON NOT NULL,
    `growth` JSON NOT NULL,
    `rewards` JSON NOT NULL,
    `efficiency` JSON NOT NULL,
    `limits` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(255) NULL,
    `propType` ENUM('FERTILIZER', 'STATUS_BUFF', 'DECORATION', 'UNLOCK', 'CONSUMABLE', 'SPECIAL') NOT NULL,
    `effect` JSON NULL,
    `buyPrice` BIGINT NULL,
    `sellPrice` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeedInventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `plantId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `itemType` ENUM('SEED', 'FRUIT', 'PROP') NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SeedInventory_userId_idx`(`userId`),
    INDEX `SeedInventory_plantId_idx`(`plantId`),
    UNIQUE INDEX `SeedInventory_userId_plantId_itemType_key`(`userId`, `plantId`, `itemType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropInventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `propId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PropInventory_userId_idx`(`userId`),
    INDEX `PropInventory_propId_idx`(`propId`),
    UNIQUE INDEX `PropInventory_userId_propId_key`(`userId`, `propId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `actionType` ENUM('PLOW', 'PLANT', 'WATER', 'FERTILIZE', 'HARVEST', 'BUY', 'SELL', 'UPGRADE', 'WEED', 'PEST', 'HELP_WATER', 'HELP_WEED', 'HELP_PEST', 'STEAL', 'SABOTAGE_WEED', 'SABOTAGE_PEST', 'LOGOUT') NOT NULL,
    `targetModel` ENUM('USER', 'USERAUTH', 'FARM', 'LANDPLOT', 'INVENTORYITEM', 'PLANT', 'FRIENDS', 'PLAYERLOG') NOT NULL,
    `targetId` INTEGER NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `param` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlayerLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `pricePerUnit` BIGINT NOT NULL,
    `totalPrice` BIGINT NOT NULL,
    `transactionType` ENUM('BUY', 'SELL') NOT NULL,
    `itemType` ENUM('SEED', 'FRUIT', 'PROP') NOT NULL,
    `plantId` INTEGER NULL,
    `propId` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShopLog_userId_idx`(`userId`),
    INDEX `ShopLog_plantId_idx`(`plantId`),
    INDEX `ShopLog_propId_idx`(`propId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
