import { ItemType } from "@prisma/client"
import type { Prisma, Plant, Prop } from "@prisma/client"
import { getLogger } from "../utils/logger.js"
import prisma from "../utils/prisma.js"
import { ApiError } from "../utils/ApiError.js"
import { AppErrorCodes } from "../utils/errorCodes.js"
import { getUpdatedPlayerState } from "../utils/helpers.js"
import type { ShopListingItem, ShopListings } from "@qqfarm/shared-types"

const logger = getLogger("ShopService")

/**
 * 获取商店中所有可供出售的商品列表。
 * @returns {Promise<ShopListings>} 包含种子和道具列表的对象。
 */
async function getShopListings(): Promise<ShopListings> {
    // 并行查询所有植物和可购买的道具
    const [plants, props] = await Promise.all([
        prisma.plant.findMany({ orderBy: { requiredLevel: "asc" } }),
        prisma.prop.findMany({ where: { buyPrice: { not: null } } })
    ])

    // 将 Plant 数据格式化为商店种子列表
    const seeds: ShopListingItem[] = plants.map((plant) => ({
        itemId: plant.id,
        name: plant.name,
        itemType: ItemType.SEED,
        buyPrice: (plant.economics as any).cost.gold.toString(),
        requiredLevel: plant.requiredLevel,
        description: `一种${plant.category || "普通"}的作物种子。`,
        image: plant.image
    }))

    // 将 Prop 数据格式化为商店道具列表
    const propItems: ShopListingItem[] = props.map((prop) => ({
        itemId: prop.id,
        name: prop.name,
        itemType: ItemType.PROP,
        buyPrice: prop.buyPrice!.toString(),
        requiredLevel: 0, // 道具默认0级可购买
        description: prop.description,
        image: prop.image
    }))

    return { seeds, props: propItems }
}

/**
 * 从商店购买指定的商品。
 * @param userId - 执行购买操作的用户ID。
 * @param itemType - 购买的物品类型 ('SEED' 或 'PROP')。
 * @param itemId - 购买的物品ID。
 * @param quantity - 购买的数量。
 */
async function buyItem(userId: number, itemType: "SEED" | "PROP", itemId: number, quantity: number) {
    if (quantity <= 0) {
        throw new ApiError(400, AppErrorCodes.VALIDATION_ERROR, "购买数量必须为正数。")
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new ApiError(404, AppErrorCodes.INTERNAL_SERVER_ERROR, "找不到用户信息。")

    let itemName: string
    let totalPrice: bigint
    let buyPrice: bigint

    // 根据物品类型获取物品信息并计算总价
    if (itemType === "SEED") {
        const plant = await prisma.plant.findUnique({ where: { id: itemId } })
        if (!plant) throw new ApiError(404, AppErrorCodes.VALIDATION_ERROR, "找不到该种子。")
        if (user.level < plant.requiredLevel) {
            throw new ApiError(403, AppErrorCodes.LEVEL_REQUIREMENT_NOT_MET, `等级不足，无法购买'${plant.name}'。`)
        }
        itemName = plant.name
        buyPrice = BigInt((plant.economics as any).cost.gold)
        totalPrice = buyPrice * BigInt(quantity)
    } else {
        // 'PROP'
        const prop = await prisma.prop.findUnique({ where: { id: itemId } })
        if (!prop || !prop.buyPrice)
            throw new ApiError(404, AppErrorCodes.VALIDATION_ERROR, "找不到该道具或该道具不可购买。")
        itemName = prop.name
        buyPrice = prop.buyPrice
        totalPrice = buyPrice * BigInt(quantity)
    }

    if (user.gold < totalPrice) {
        throw new ApiError(400, 1, "金币不足，无法购买。")
    }

    // 在一个事务中完成所有数据库操作
    return await prisma.$transaction(async (tx) => {
        // 1. 扣除用户金币
        await tx.user.update({ where: { id: userId }, data: { gold: { decrement: totalPrice } } })

        // 2. 将物品添加到对应的库存表中
        if (itemType === "SEED") {
            await tx.seedInventory.upsert({
                where: { userId_plantId_itemType: { userId, plantId: itemId, itemType: "SEED" } },
                update: { quantity: { increment: quantity } },
                create: { userId, plantId: itemId, quantity, itemType: "SEED" }
            })
            // 3. 记录商店日志
            await tx.shopLog.create({
                data: {
                    userId,
                    plantId: itemId,
                    quantity,
                    pricePerUnit: buyPrice,
                    totalPrice,
                    transactionType: "BUY",
                    itemType: "SEED"
                }
            })
        } else {
            // 'PROP'
            await tx.propInventory.upsert({
                where: { userId_propId: { userId, propId: itemId } },
                update: { quantity: { increment: quantity } },
                create: { userId, propId: itemId, quantity }
            })
            // 3. 记录商店日志
            await tx.shopLog.create({
                data: {
                    userId,
                    propId: itemId,
                    quantity,
                    pricePerUnit: buyPrice,
                    totalPrice,
                    transactionType: "BUY",
                    itemType: "PROP"
                }
            })
        }

        logger.info(`用户 ${userId} 购买了 ${quantity} 个 ${itemName}`)
        // 4. 返回用户更新后的状态
        return getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })
}

/**
 * 将背包中的物品出售给商店。
 * @param userId - 执行出售操作的用户ID。
 * @param itemType - 出售的物品类型 ('SEED', 'FRUIT', 或 'PROP')。
 * @param itemId - 出售的物品ID。
 * @param quantity - 出售的数量。
 */
async function sellItem(userId: number, itemType: ItemType, itemId: number, quantity: number) {
    if (quantity <= 0) {
        throw new ApiError(400, AppErrorCodes.VALIDATION_ERROR, "出售数量必须为正数。")
    }

    let sellPrice: bigint
    let itemName: string
    let totalGain: bigint

    return await prisma.$transaction(async (tx) => {
        // 根据物品类型在不同的库存表中操作
        if (itemType === ItemType.PROP) {
            const propInventory = await tx.propInventory.findUnique({
                where: { userId_propId: { userId, propId: itemId } },
                include: { prop: true }
            })
            if (!propInventory || propInventory.quantity < quantity) {
                throw new ApiError(400, 1, "道具数量不足，无法出售。")
            }
            const prop = propInventory.prop
            sellPrice = prop.sellPrice
            itemName = prop.name
            totalGain = sellPrice * BigInt(quantity)

            // 1. 从库存中扣除数量
            await tx.propInventory.update({
                where: { id: propInventory.id },
                data: { quantity: { decrement: quantity } }
            })

            // 2. 记录商店日志
            await tx.shopLog.create({
                data: {
                    userId,
                    propId: itemId,
                    quantity,
                    pricePerUnit: sellPrice,
                    totalPrice: totalGain,
                    transactionType: "SELL",
                    itemType: "PROP"
                }
            })
        } else {
            // SEED or FRUIT
            const seedInventory = await tx.seedInventory.findUnique({
                where: { userId_plantId_itemType: { userId, plantId: itemId, itemType } },
                include: { plant: true }
            })
            if (!seedInventory || seedInventory.quantity < quantity) {
                throw new ApiError(400, 1, "物品数量不足，无法出售。")
            }
            const plant = seedInventory.plant
            itemName = plant.name

            // 根据是种子还是果实确定卖出价格
            if (itemType === ItemType.FRUIT) {
                sellPrice = BigInt((plant.economics as any).revenue.sellPricePerUnit)
            } else {
                // SEED
                // 游戏机制设定：种子只能以买入价的一半出售
                const buyPrice = BigInt((plant.economics as any).cost.gold)
                sellPrice = buyPrice / 2n
            }
            totalGain = sellPrice * BigInt(quantity)

            // 1. 从库存中扣除数量
            await tx.seedInventory.update({
                where: { id: seedInventory.id },
                data: { quantity: { decrement: quantity } }
            })

            // 2. 记录商店日志
            await tx.shopLog.create({
                data: {
                    userId,
                    plantId: itemId,
                    quantity,
                    pricePerUnit: sellPrice,
                    totalPrice: totalGain,
                    transactionType: "SELL",
                    itemType
                }
            })
        }

        // 3. 为用户增加金币
        await tx.user.update({
            where: { id: userId },
            data: { gold: { increment: totalGain } }
        })

        logger.info(`用户 ${userId} 出售了 ${quantity} 个 ${itemName}，获得 ${totalGain} 金币`)
        // 4. 返回用户更新后的状态
        return getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })
}

const shopService = {
    getShopListings,
    buyItem,
    sellItem
}

export default shopService
