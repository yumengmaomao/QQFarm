import prisma from "../utils/prisma.js"
import logService from "./log.js"
import { ActionType, TargetModel, Prisma } from "@prisma/client"
import { ApiError } from "../utils/ApiError.js"
import { AppErrorCodes } from "../utils/errorCodes.js"
import leaderboardService from "./leaderboard.js"
import { getUpdatedPlayerState, transformPlotData } from "../utils/helpers.js"
import type {
    PlantPlotResponse,
    WaterPlotResponse,
    FertilizePlotResponse,
    RemovePestsPlotResponse,
    RemoveWeedsPlotResponse,
    HarvestPlotResponse
} from "@qqfarm/shared-types"
const BASE_INTERACTION_EXP = 30 // 基础互动获得的经验值

/**
 * 辅助函数：根据农场ID和地块索引获取地块信息
 */
async function getPlot(farmId: number, plotIndex: number) {
    const plot = await prisma.landPlot.findUnique({
        where: {
            farmId_plotIndex: {
                farmId,
                plotIndex
            }
        },
        include: {
            plant: true
        }
    })
    if (!plot) {
        throw new ApiError(404, AppErrorCodes.PLOT_NOT_FOUND, `找不到你的 ${plotIndex} 号土地。`)
    }
    return plot
}
/**
 * 种植作物
 * @param userId - 当前操作的用户ID
 * @param farmId - 用户的农场ID
 * @param plotIndex - 用户的农场ID
 * @param plantId - 要种植的植物（种子）ID
 */
async function plantPlot(
    userId: number,
    farmId: number,
    plotIndex: number,
    plantId: number
): Promise<PlantPlotResponse> {
    const plot = await getPlot(farmId, plotIndex)
    if (plot.plantId) {
        throw new ApiError(400, AppErrorCodes.PLOT_NOT_EMPTY, "这块土地已经种上东西了。")
    }

    const [plantToGrow, user, seedInInventory] = await Promise.all([
        prisma.plant.findUnique({ where: { id: plantId } }),
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.seedInventory.findUnique({
            where: { userId_plantId_itemType: { userId, plantId: plantId, itemType: "SEED" } }
        })
    ])

    if (!plantToGrow) throw new ApiError(404, AppErrorCodes.VALIDATION_ERROR, `ID为 ${plantId} 的种子不存在。`)

    if (!user) throw new ApiError(404, AppErrorCodes.INTERNAL_SERVER_ERROR, "找不到当前用户信息。")

    if (user.level < plantToGrow.requiredLevel) {
        throw new ApiError(
            403,
            AppErrorCodes.LEVEL_REQUIREMENT_NOT_MET,
            `你的等级不足，需要达到 ${plantToGrow.requiredLevel} 级才能种植'${plantToGrow.name}'。`
        )
    }

    if (!seedInInventory || seedInInventory.quantity <= 0) {
        throw new ApiError(400, AppErrorCodes.INSUFFICIENT_SEEDS, `你的背包里没有'${plantToGrow.name}'的种子了。`)
    }

    const [updatedPlot, playerState] = await prisma.$transaction(async (tx) => {
        await tx.seedInventory.update({
            where: { id: seedInInventory.id },
            data: { quantity: { decrement: 1 } }
        })

        const updatedFarm = await tx.farm.update({
            where: { id: farmId },
            data: { maturityCycleCounter: { increment: 1 } },
            select: { maturityCycleCounter: true }
        })
        const newMaturityCycleId = updatedFarm.maturityCycleCounter

        const newPlot = await tx.landPlot.update({
            where: { id: plot.id },
            data: {
                plantId: plantId,
                plantTime: new Date(),
                maturityCycleId: newMaturityCycleId,
                waterState: 0,
                fertilizerState: 0,
                hasPests: false,
                hasWeeds: false,
                stolenNum: 0,
                growthTimeReducedSeconds: 0
            },
            include: {
                plant: true
            }
        })
        //@ts-expect-error
        const playerState = await getUpdatedPlayerState(userId, tx)
        return [newPlot, playerState]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.PLANT,
        targetModel: TargetModel.LANDPLOT,
        targetId: updatedPlot.id,
        oldData: plot,
        newData: updatedPlot,
        param: `在 ${plotIndex} 号地块种植了 ${plantToGrow.name}`
    })

    return {
        plots: await transformPlotData(updatedPlot),
        inventory: playerState.inventory
    }
}
/**
 *  土地浇水
 * @param userId - 当前操作的用户ID
 * @param farmId - 用户的农场ID
 * @param plotIndex - 用户的农场ID
 * @returns
 */
async function waterPlot(userId: number, farmId: number, plotIndex: number): Promise<WaterPlotResponse> {
    const plotBefore = await getPlot(farmId, plotIndex)

    if (plotBefore.waterState !== 2) {
        throw new ApiError(400, AppErrorCodes.NOTHING_TO_WATER, "这块土地现在不需要浇水。")
    }
    const [plotAfter, playerState] = await prisma.$transaction(async (tx) => {
        const plotAfter = await prisma.landPlot.update({
            where: { id: plotBefore.id },
            data: { waterState: 1 },
            include: { plant: true }
        })
        await prisma.user.update({
            where: { id: userId },
            data: { exp: { increment: BASE_INTERACTION_EXP / 3 } }
        })
        //@ts-expect-error
        const playerState = await getUpdatedPlayerState(userId, tx)
        return [plotAfter, playerState]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.WATER,
        targetModel: TargetModel.LANDPLOT,
        targetId: plotAfter.id,
        oldData: plotBefore,
        newData: plotAfter,
        param: `给 ${plotIndex} 号土地浇水，获得经验 ${BASE_INTERACTION_EXP}`
    })

    return {
        plots: await transformPlotData(plotAfter),
        user: playerState.user
    }
}

/**
 * 施肥
 */
async function fertilizePlot(
    userId: number,
    farmId: number,
    plotIndex: number,
    reduction: { type: "PERCENTAGE" | "SECONDS"; value: number }
): Promise<FertilizePlotResponse> {
    const plotBefore = await getPlot(farmId, plotIndex)

    if (!plotBefore.plantId || !plotBefore.plantTime) {
        throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "不能给空地施肥。")
    }

    const plantData = await prisma.plant.findUnique({ where: { id: plotBefore.plantId } })
    if (!plantData) {
        throw new ApiError(404, AppErrorCodes.VALIDATION_ERROR, `ID为 ${plotBefore.plantId} 的种子不存在。`)
    }

    let secondsToReduce = 0
    const growthData = plantData.growth as any

    if (reduction.type === "PERCENTAGE") {
        secondsToReduce = Math.floor(growthData.totalSeconds * (reduction.value / 100))
    } else if (reduction.type === "SECONDS") {
        secondsToReduce = reduction.value
    }

    const [plotAfter, playerState] = await prisma.$transaction(async (tx) => {
        const plotAfter = await prisma.landPlot.update({
            where: { id: plotBefore.id },
            data: { fertilizerState: 1, growthTimeReducedSeconds: { increment: secondsToReduce } },
            include: { plant: true }
        })
        await prisma.user.update({
            where: { id: userId },
            data: { exp: { increment: BASE_INTERACTION_EXP / 3 } }
        })
        //@ts-expect-error
        const playerState = await getUpdatedPlayerState(userId, tx)
        return [plotAfter, playerState]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.FERTILIZE,
        targetModel: TargetModel.LANDPLOT,
        targetId: plotAfter.id,
        oldData: plotBefore,
        newData: plotAfter,
        param: `给 ${plotIndex} 号土地使用肥料，作物生长时间减少 ${secondsToReduce} 秒`
    })

    return {
        plots: await transformPlotData(plotAfter),
        user: playerState.user,
        inventory: playerState.inventory
    }
}

/**
 * 除草
 */
async function removeWeeds(userId: number, farmId: number, plotIndex: number): Promise<RemoveWeedsPlotResponse> {
    const plotBefore = await getPlot(farmId, plotIndex)
    if (!plotBefore.hasWeeds) {
        throw new ApiError(400, AppErrorCodes.NO_WEEDS_TO_REMOVE, "这块土地上没有杂草。")
    }

    const [plotAfter, playerState] = await prisma.$transaction(async (tx) => {
        const plotAfter = await prisma.landPlot.update({
            where: { id: plotBefore.id },
            data: { hasWeeds: false, weedPlacedBy: null },
            include: { plant: true }
        })
        await prisma.user.update({
            where: { id: userId },
            data: { exp: { increment: BASE_INTERACTION_EXP / 3 } }
        })
        //@ts-expect-error
        const playerState = await getUpdatedPlayerState(userId, tx)
        return [plotAfter, playerState]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.WEED,
        targetModel: TargetModel.LANDPLOT,
        targetId: plotAfter.id,
        oldData: plotBefore,
        newData: plotAfter,
        param: `给 ${plotIndex} 号土地除草，获得经验 ${BASE_INTERACTION_EXP}`
    })

    return {
        plots: await transformPlotData(plotAfter),
        user: playerState.user
    }
}

/**
 * 除虫
 */
async function removePests(userId: number, farmId: number, plotIndex: number): Promise<RemovePestsPlotResponse> {
    const plotBefore = await getPlot(farmId, plotIndex)
    if (!plotBefore.hasPests) {
        throw new ApiError(400, AppErrorCodes.NO_PESTS_TO_REMOVE, "这块土地上没有害虫。")
    }

    const [plotAfter, playerState] = await prisma.$transaction(async (tx) => {
        const plotAfter = await prisma.landPlot.update({
            where: { id: plotBefore.id },
            data: { hasPests: false, pestPlacedBy: null },
            include: { plant: true }
        })
        await prisma.user.update({
            where: { id: userId },
            data: { exp: { increment: BASE_INTERACTION_EXP / 3 } }
        })
        //@ts-expect-error
        const playerState = await getUpdatedPlayerState(userId, tx)
        return [plotAfter, playerState]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.PEST,
        targetModel: TargetModel.LANDPLOT,
        targetId: plotAfter.id,
        oldData: plotBefore,
        newData: plotAfter,
        param: `给 ${plotIndex} 号土地除虫，获得经验 ${BASE_INTERACTION_EXP}`
    })

    return {
        plots: await transformPlotData(plotAfter),
        user: playerState.user
    }
}

/**
 * 收获作物
 */
async function harvestPlot(userId: number, farmId: number, plotIndex: number) {
    const plotBefore = await getPlot(farmId, plotIndex)
    if (!plotBefore.plantId || !plotBefore.plantTime) {
        throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "这块土地上没有可收获的作物。")
    }
    const plantData = await prisma.plant.findUnique({ where: { id: plotBefore.plantId } })
    if (!plantData) {
        throw new ApiError(404, AppErrorCodes.VALIDATION_ERROR, `ID为 ${plotBefore.plantId} 的种子不存在。`)
    }

    const status = await prisma.landPlot.calculateStatus(plotBefore)
    if (status.status !== "matured") {
        throw new ApiError(400, AppErrorCodes.CROP_NOT_MATURED, "作物尚未成熟！")
    }

    const { economics, rewards } = plantData as any
    const gainedExp = rewards.exp
    const harvestedItemId = plotBefore.plantId

    const harvestedQuantity = economics.revenue.yield - plotBefore.stolenNum

    if (harvestedQuantity <= 0) {
        throw new ApiError(400, AppErrorCodes.NOTHING_TO_HARVEST, "作物已被偷光，无东西可收获了！")
    }

    const [plotAfter] = await prisma.$transaction(async (tx) => {
        const updatedPlot = await tx.landPlot.update({
            where: { id: plotBefore.id },
            data: {
                plantId: null,
                plantTime: null,
                maturityCycleId: null,
                waterState: 0,
                fertilizerState: 0,
                hasPests: false,
                hasWeeds: false,
                stolenNum: 0,
                growthTimeReducedSeconds: 0
            }
        })

        await tx.user.update({
            where: { id: userId },
            data: { exp: { increment: gainedExp } }
        })

        // 只将实际收获的数量添加到背包
        await tx.seedInventory.upsert({
            where: { userId_plantId_itemType: { userId, plantId: harvestedItemId, itemType: "FRUIT" } },
            update: { quantity: { increment: harvestedQuantity } },
            create: { userId, plantId: harvestedItemId, itemType: "FRUIT", quantity: harvestedQuantity }
        })

        return [updatedPlot]
    })

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.HARVEST,
        targetModel: TargetModel.LANDPLOT,
        targetId: plotAfter.id,
        oldData: plotBefore,
        newData: plotAfter,
        param: `在 ${plotIndex} 号土地收获了 ${harvestedQuantity} 个 ${plantData.name}，获得经验 ${gainedExp}`
    })
    return {
        hrvest: {
            plotIndex: plotBefore.plotIndex,
            gains: {
                exp: gainedExp,
                item: {
                    itemId: plantData.id,
                    name: plantData.name,
                    quantity: harvestedQuantity
                }
            }
        }
    }
}

const plotService = {
    getPlot,
    plantPlot,
    waterPlot,
    fertilizePlot,
    removeWeeds,
    removePests,
    harvestPlot
}

export default plotService
