import { ActionType, Prisma, TargetModel } from "@prisma/client"
import type {
    plantAllResponse,
    HarvestAllResponse,
    removeAllPestsResponse,
    removeAllWeedsResponse,
    WaterAllResponse
} from "@qqfarm/shared-types"
import type { PlayerLogData, LandPlotWithPlant } from "../types/index.js"
import { ApiError } from "../utils/ApiError.js"
import { AppErrorCodes } from "../utils/errorCodes.js"
import prisma from "../utils/prisma.js"
import logService from "./log.js"
import { getUpdatedPlayerState, transformPlotData } from "../utils/helpers.js"

const BASE_INTERACTION_EXP = 30

async function getUserFarmWithPlots(userId: number) {
    const farm = await prisma.farm.findUnique({
        where: { userId },
        include: {
            lands: {
                include: {
                    plant: true
                }
            }
        }
    })
    if (!farm) {
        throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "找不到农场")
    }
    return farm
}

/**
 * 一键为所有干旱的地块浇水
 */
async function waterAllDryPlots(userId: number): Promise<WaterAllResponse> {
    const farm = await getUserFarmWithPlots(userId)
    const dryPlots = farm.lands.filter((plot) => plot.waterState === 2)

    if (dryPlots.length === 0) {
        throw new ApiError(400, AppErrorCodes.NOTHING_TO_WATER, "你的农场里没有需要浇水的地块。")
    }

    const dryPlotIds = dryPlots.map((plot) => plot.id)
    const gainedExp = dryPlots.length * BASE_INTERACTION_EXP
    let playerState

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: { exp: { increment: gainedExp } }
        })
        await tx.landPlot.updateMany({
            where: { id: { in: dryPlotIds } },
            data: { waterState: 1 }
        })

        playerState = await getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })

    const updatedPlots = await prisma.landPlot.findMany({ where: { id: { in: dryPlotIds } } })

    const logsToCreate = dryPlots.map((oldPlot) => {
        const newPlot = updatedPlots.find((p) => p.id === oldPlot.id)
        return {
            userId,
            actionType: ActionType.WATER,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `一键浇水: 在 ${oldPlot.plotIndex} 号地浇水。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.WATER,
        targetModel: TargetModel.FARM,
        targetId: farm.id,
        param: `一键浇水 ${dryPlots.length} 块土地，获得经验 ${gainedExp}`
    })

    return {
        result: { wateredCount: dryPlots.length, gainedExp },
        user: playerState!.user
    }
}

/**
 * 一键为所有地块除草
 */
async function removeAllWeeds(userId: number): Promise<removeAllWeedsResponse> {
    const farm = await getUserFarmWithPlots(userId)
    const weededPlots = farm.lands.filter((plot) => plot.hasWeeds)

    if (weededPlots.length === 0) {
        throw new ApiError(400, AppErrorCodes.NO_WEEDS_TO_REMOVE, "你的农场非常干净，没有杂草！")
    }

    const weededPlotIds = weededPlots.map((plot) => plot.id)
    const gainedExp = weededPlots.length * BASE_INTERACTION_EXP
    let playerState

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: { exp: { increment: gainedExp } }
        })
        await tx.landPlot.updateMany({
            where: { id: { in: weededPlotIds } },
            data: { hasWeeds: false, weedPlacedBy: null }
        })
        playerState = await getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })

    const updatedPlots = await prisma.landPlot.findMany({ where: { id: { in: weededPlotIds } } })

    const logsToCreate = weededPlots.map((oldPlot) => {
        const newPlot = updatedPlots.find((p) => p.id === oldPlot.id)
        return {
            userId,
            actionType: ActionType.WEED,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `一键除草: 清除了 ${oldPlot.plotIndex} 号地的杂草。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.WEED,
        targetModel: TargetModel.FARM,
        targetId: farm.id,
        param: `一键除草 ${weededPlots.length} 块土地，获得经验 ${gainedExp}`
    })

    return {
        result: {
            removedCount: weededPlotIds.length,
            gainedExp
        },
        user: playerState!.user
    }
}

/**
 *一键为所有地块除虫
 */
async function removeAllPests(userId: number): Promise<removeAllPestsResponse> {
    const farm = await getUserFarmWithPlots(userId)
    const pestPlots = farm.lands.filter((plot) => plot.hasPests)

    if (pestPlots.length === 0) {
        throw new ApiError(400, AppErrorCodes.NO_PESTS_TO_REMOVE, "你的农场状态很好，没有害虫！")
    }

    const pestPlotIds = pestPlots.map((plot) => plot.id)
    const gainedExp = pestPlots.length * BASE_INTERACTION_EXP
    let playerState

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: { exp: { increment: gainedExp } }
        })
        await tx.landPlot.updateMany({
            where: { id: { in: pestPlotIds } },
            data: { hasPests: false, pestPlacedBy: null }
        })
        playerState = await getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })

    const updatedPlots = await prisma.landPlot.findMany({ where: { id: { in: pestPlotIds } } })

    const logsToCreate = pestPlots.map((oldPlot) => {
        const newPlot = updatedPlots.find((p) => p.id === oldPlot.id)
        return {
            userId,
            actionType: ActionType.PEST,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `一键除虫: 清除了 ${oldPlot.plotIndex} 号地的害虫。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.PEST,
        targetModel: TargetModel.FARM,
        targetId: farm.id,
        param: `一键除虫 ${pestPlots.length} 块土地，获得经验 ${gainedExp}`
    })

    return {
        result: {
            removedCount: pestPlots.length,
            gainedExp
        },
        user: playerState!.user
    }
}
/**
 * 一键收获所有已成熟的作物
 */
async function harvestAllMaturedPlots(userId: number): Promise<HarvestAllResponse> {
    const farm = await getUserFarmWithPlots(userId)
    const maturedPlots: LandPlotWithPlant[] = []

    for (const plot of farm.lands) {
        if (plot.plant && plot.plantTime) {
            const status = await prisma.landPlot.calculateStatus(plot)
            if (status.status === "matured") {
                maturedPlots.push(plot)
            }
        }
    }

    if (maturedPlots.length === 0) {
        throw new ApiError(404, AppErrorCodes.NOTHING_TO_HARVEST, "没有成熟作物")
    }

    const totalGains: HarvestAllResponse["harvestReport"]["summary"]["totalGains"] = {
        totalexp: 0,
        totalitems: []
    }
    const details: HarvestAllResponse["harvestReport"]["details"] = []

    const maturedPlotIds = maturedPlots.map((p) => p.id)

    const PlayerState = await prisma.$transaction(async (tx) => {
        for (const plot of maturedPlots) {
            if (!plot.plant) continue

            const plantData = plot.plant as any

            totalGains.totalexp += plantData.rewards.exp

            const harvestedQuantity = plantData.economics.revenue.yield - plot.stolenNum
            if (harvestedQuantity <= 0) continue

            const item = { itemId: plantData.id, name: plantData.name, quantity: harvestedQuantity }

            const currentItem = totalGains.totalitems.find((i) => i.itemId === plantData.id)
            if (currentItem) {
                currentItem.quantity += harvestedQuantity
            } else {
                totalGains.totalitems.push(item)
            }
            details.push({
                plotIndex: plot.plotIndex,
                gains: {
                    exp: plantData.rewards.exp,
                    item
                }
            })
        }

        await tx.user.update({ where: { id: userId }, data: { exp: { increment: totalGains.totalexp } } })

        for (const itemInfo of totalGains.totalitems) {
            await tx.seedInventory.upsert({
                where: { userId_plantId_itemType: { userId, plantId: itemInfo.itemId, itemType: "FRUIT" } },
                update: { quantity: { increment: itemInfo.quantity } },
                create: { userId, plantId: itemInfo.itemId, itemType: "FRUIT", quantity: itemInfo.quantity }
            })
        }

        await tx.landPlot.updateMany({
            where: { id: { in: maturedPlotIds } },
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

        return await getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })
    const updatedPlotsForLogging = await prisma.landPlot.findMany({
        where: { id: { in: maturedPlotIds } },
        include: { plant: true }
    })
    const logs: PlayerLogData[] = maturedPlots.map((oldPlot) => {
        const newPlot = updatedPlotsForLogging.find((p) => p.id === oldPlot.id)
        const gainsDetail = details.find((d) => d.plotIndex === oldPlot.plotIndex)
        const harvestedQty = gainsDetail ? gainsDetail.gains.item.quantity : 0

        return {
            userId,
            actionType: ActionType.HARVEST,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `在 ${oldPlot.plotIndex} 号土地收获了 ${harvestedQty} 个 ${oldPlot.plant!.name}`
        }
    })

    await logService.createPlayerLogs(logs as any)
    const transformedPlots = await Promise.all(updatedPlotsForLogging.map((p) => transformPlotData(p)))
    return {
        harvestReport: {
            summary: {
                harvestedPlotsCount: maturedPlots.length,
                totalGains
            },
            details
        },
        plots: transformedPlots,
        user: PlayerState.user,
        inventory: PlayerState.inventory
    }
}

/**
 * 新增：一键在所有空地上种植指定作物
 */
async function plantAllEmptyPlots(userId: number, farmId: number, plantId: number): Promise<plantAllResponse> {
    const farmData = await getUserFarmWithPlots(userId)
    const emptyPlots = farmData.lands.filter((plot) => !plot.plantId)

    if (emptyPlots.length === 0) {
        throw new ApiError(400, AppErrorCodes.PLOT_NOT_EMPTY, "没有空闲的地块可以种植了。")
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
    if (user.level < plantToGrow.requiredLevel)
        throw new ApiError(
            403,
            AppErrorCodes.LEVEL_REQUIREMENT_NOT_MET,
            `你的等级不足，需要达到 ${plantToGrow.requiredLevel} 级才能种植'${plantToGrow.name}'。`
        )
    if (!seedInInventory || seedInInventory.quantity <= 0)
        throw new ApiError(400, AppErrorCodes.INSUFFICIENT_SEEDS, `你的背包里没有'${plantToGrow.name}'的种子了。`)

    const plotsToPlantCount = Math.min(emptyPlots.length, seedInInventory.quantity)
    const plotsToUpdate = emptyPlots.slice(0, plotsToPlantCount)

    let playerState

    await prisma.$transaction(async (tx) => {
        await tx.seedInventory.update({
            where: { id: seedInInventory.id },
            data: { quantity: { decrement: plotsToPlantCount } }
        })

        const startingCycleId = farmData!.maturityCycleCounter
        await tx.farm.update({
            where: { id: farmId },
            data: { maturityCycleCounter: { increment: plotsToPlantCount } }
        })

        for (let i = 0; i < plotsToUpdate.length; i++) {
            const plot = plotsToUpdate[i]
            if (!plot) continue
            const maturityCycleId = startingCycleId + BigInt(i) + 1n
            await tx.landPlot.update({
                where: { id: plot.id },
                data: {
                    plantId: plantId,
                    plantTime: new Date(),
                    maturityCycleId: maturityCycleId,
                    waterState: 0,
                    fertilizerState: 0,
                    hasPests: false,
                    hasWeeds: false,
                    stolenNum: 0,
                    growthTimeReducedSeconds: 0
                }
            })
        }

        playerState = await getUpdatedPlayerState(userId, tx as unknown as Prisma.TransactionClient)
    })

    const plotsToUpdateIds = plotsToUpdate.map((p) => p.id)
    const updatedPlotsResult = await prisma.landPlot.findMany({
        where: { id: { in: plotsToUpdateIds } },
        include: { plant: true }
    })
    const logs: PlayerLogData[] = plotsToUpdate.map((oldPlot) => {
        const newPlot = updatedPlotsResult.find((p) => p.id === oldPlot.id)
        return {
            userId,
            actionType: ActionType.PLANT,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `一键种植: 在 ${oldPlot.plotIndex} 号土地种植了 ${newPlot!.plant!.name}`
        }
    })
    await logService.createPlayerLogs(logs as any)

    const transformedPlots = await Promise.all(updatedPlotsResult.map((p) => transformPlotData(p)))

    await logService.createPlayerLog({
        userId,
        actionType: ActionType.PLANT,
        targetModel: TargetModel.FARM,
        targetId: farmData.id,
        param: `一键种植了 ${plotsToPlantCount} 块'${plantToGrow.name}'`
    })

    return {
        plantReport: {
            plantCount: plotsToPlantCount
        },
        plots: transformedPlots,
        inventory: playerState!.inventory
    }
}

const farmService = {
    waterAllDryPlots,
    removeAllWeeds,
    removeAllPests,
    harvestAllMaturedPlots,
    plantAllEmptyPlots
}

export default farmService
