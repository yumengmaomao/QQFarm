import prisma from "../utils/prisma.js"
import type { LandPlot, Plant, Prisma } from "@prisma/client"
import type { PlotState, InventoryState } from "@qqfarm/shared-types"
// 等级经验配置 (可以根据你的游戏设计调整)
const getExpForLevel = (level: number) => {
    // 这是一个简单的指数增长公式，你可以替换成你的游戏的实际公式
    return 50 * Math.pow(level, 2) + 150 * level
}

/**
 * 获取玩家更新后的核心状态（用户属性和背包）
 * @param userId - 需要获取状态的用户ID
 * @param tx - 可选的Prisma事务客户端，如果在事务中调用此函数，应传入
 */
export async function getUpdatedPlayerState(userId: number, tx: Prisma.TransactionClient) {
    const user = await tx.user.findUnique({ where: { id: userId } })

    // 如果找不到用户，返回一个默认的空状态
    if (!user) {
        return {
            user: {
                id: 0,
                nickName: "",
                level: 0,
                exp: 0,
                expToNextLevel: 999999, // 附加字段
                gold: "0", // 将 BigInt 转换为字符串以兼容JSON
                premiumCurrency: 0
            },
            inventory: { seeds: [], fruits: [], props: {} }
        }
    }

    const expToNextLevel = getExpForLevel(user.level)

    const seedInventoryItems = await prisma.seedInventory.findMany({
        where: { userId, quantity: { gt: 0 } },
        include: { plant: { select: { name: true } } }
    })

    const propInventoryItems = await prisma.propInventory.findMany({
        where: { userId, quantity: { gt: 0 } },
        include: { prop: { select: { name: true, propType: true } } }
    })
    const propsGrouped = propInventoryItems.reduce((acc, i) => {
        const type = i.prop.propType
        // 如果累加器中还没有这个类型的数组，则初始化一个
        if (!acc[type]) {
            acc[type] = []
        }
        // 将当前物品添加到对应类型的数组中
        acc[type]!.push({
            itemId: i.propId,
            name: i.prop.name,
            quantity: i.quantity
        })
        return acc
    }, {} as InventoryState["props"])
    // 将背包物品分类为种子和果实
    const inventory: InventoryState = {
        seeds: seedInventoryItems
            .filter((i) => i.itemType === "SEED" && i.quantity > 0)
            .map((i) => ({ itemId: i.id, name: i.plant.name, quantity: i.quantity })),
        fruits: seedInventoryItems
            .filter((i) => i.itemType === "FRUIT" && i.quantity > 0)
            .map((i) => ({ itemId: i.id, name: i.plant.name, quantity: i.quantity })),
        props: propsGrouped
    }

    return {
        user: {
            id: user.id,
            nickName: user.nickName,
            level: user.level,
            exp: user.exp,
            expToNextLevel, // 附加字段
            gold: user.gold.toString(), // 将 BigInt 转换为字符串以兼容JSON
            premiumCurrency: user.premiumCurrency
        },
        inventory
    }
}
/**
 * 递归遍历对象或数组，将所有 BigInt 值转换为字符串。
 * @param obj - 任意类型的数据，通常是一个对象或数组。
 * @returns 转换后的数据，其中所有 BigInt 都已变为字符串。
 */
export function convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj
    }

    // 如果是 BigInt 类型，直接返回其字符串形式
    if (typeof obj === "bigint") {
        return obj.toString()
    }

    // 如果是数组，递归处理每个元素
    if (Array.isArray(obj)) {
        return obj.map((item) => convertBigIntToString(item))
    }

    // 如果是普通对象，递归处理每个属性
    if (typeof obj === "object") {
        const newObj: { [key: string]: any } = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = convertBigIntToString(obj[key])
            }
        }
        return newObj
    }

    // 其他原始类型直接返回
    return obj
}
/**
 * 【新增】将 Prisma 的 LandPlot 对象转换为前端需要的 PlotState 对象
 * @param plot - 从 Prisma 查询出的地块对象，需要 include: { plant: true }
 */
export async function transformPlotData(plot: LandPlot & { plant: Plant | null }): Promise<PlotState> {
    // 调用在 prisma.ts 中扩展的 calculateStatus 方法
    const statusInfo = await prisma.landPlot.calculateStatus(plot)

    return {
        id: plot.id,
        plotIndex: plot.plotIndex,
        plant: plot.plant
            ? {
                  id: plot.plant.id,
                  name: plot.plant.name,
                  image: plot.plant.image
              }
            : null,
        status: statusInfo.status as PlotState["status"],
        currentStage: statusInfo.currentStage as PlotState["currentStage"],
        growthPercentage: statusInfo.growthPercentage,
        remainingSeconds: statusInfo.remainingSeconds,
        waterState: plot.waterState,
        fertilizerState: plot.fertilizerState,
        hasWeeds: plot.hasWeeds,
        hasPests: plot.hasPests,
        stolenNum: plot.stolenNum
    }
}
