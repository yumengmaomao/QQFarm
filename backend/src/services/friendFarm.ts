import prisma from "../utils/prisma.js"
import logService from "./log.js"
import { ActionType, TargetModel, type Plant, Prisma, FriendRequestStatus } from "@prisma/client"
import { ApiError } from "../utils/ApiError.js"
import { AppErrorCodes } from "../utils/errorCodes.js"
import type { LandPlotWithPlant } from "../types/index.js"
import { getUpdatedPlayerState, transformPlotData } from "../utils/helpers.js"
import leaderboardService from "./leaderboard.js"
import type {
    StealAllResponse,
    placeWeedOnAllResponse,
    placePestOnAllResponse,
    StealPlotResponse,
    SabotageFriendResponse,
    HelpFriendResponse
} from "@qqfarm/shared-types"

const HELP_INTERACTION_EXP = 15
const MAX_SABOTAGE_ACTIONS_PER_DAY = 5

/**
 * 辅助函数：获取好友的农场及所有地块信息
 */
async function getFriendFarmWithPlots(currentUserId: number, friendId: number) {
    if (currentUserId === friendId) {
        throw new ApiError(400, AppErrorCodes.CANNOT_INTERACT_WITH_SELF, "不能对自己的农场进行此操作。")
    }
    // 【修复】使用正确的字段名 requesterId 和 addresseeId
    const friendship = await prisma.friendship.findFirst({
        where: {
            requesterId: currentUserId,
            addresseeId: friendId,
            status: FriendRequestStatus.ACCEPTED
        }
    })
    if (!friendship) {
        throw new ApiError(403, AppErrorCodes.NOT_FRIENDS, "你们不是好友，不能进行此操作。")
    }
    const farm = await prisma.farm.findUnique({
        where: { userId: friendId },
        include: { lands: { include: { plant: true } } }
    })
    if (!farm) {
        throw new ApiError(404, AppErrorCodes.FRIEND_NOT_FOUND, "找不到好友的农场。")
    }
    return farm
}

/**
 * 辅助函数：获取好友的单个地块
 */
async function getFriendPlot(currentUserId: number, friendId: number, plotIndex: number) {
    const farm = await getFriendFarmWithPlots(currentUserId, friendId)
    const targetPlot = farm.lands.find((p) => p.plotIndex === plotIndex)
    if (!targetPlot) {
        throw new ApiError(404, AppErrorCodes.PLOT_NOT_FOUND, `找不到好友的 ${plotIndex} 号土地。`)
    }
    return targetPlot
}

/**
 * 检查并更新每日互动次数限制
 */
async function checkDailyActionLimit(userId: number, action: ActionType, count: number = 1) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const interaction = await prisma.dailyInteraction.findUnique({
        where: { userId_actionType_date: { userId, actionType: action, date: today } }
    })
    const currentCount = interaction?.count || 0
    if (currentCount + count > MAX_SABOTAGE_ACTIONS_PER_DAY) {
        throw new ApiError(
            403,
            AppErrorCodes.DAILY_SABOTAGE_LIMIT_EXCEEDED,
            `今日捣乱次数已达上限！今天已进行了 ${currentCount} 次，还可进行 ${
                MAX_SABOTAGE_ACTIONS_PER_DAY - currentCount
            } 次。`
        )
    }
    await prisma.dailyInteraction.upsert({
        where: { userId_actionType_date: { userId, actionType: action, date: today } },
        update: { count: { increment: count } },
        create: { userId, actionType: action, date: today, count: count }
    })
}
/**
 * 偷菜
 */
async function stealFromPlot(stealerId: number, friendId: number, plotIndex: number): Promise<StealPlotResponse> {
    const targetPlot = await getFriendPlot(stealerId, friendId, plotIndex)
    if (!targetPlot.plantId || !targetPlot.plantTime || !targetPlot.plant) {
        throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "这块土地上当前没有可偷窃的作物。")
    }

    const status = await prisma.landPlot.calculateStatus(targetPlot)
    if (status.status !== "matured") {
        throw new ApiError(400, AppErrorCodes.CROP_NOT_MATURED, "别着急，作物理成熟还有一段时间呢！")
    }

    const plantData = targetPlot.plant as any

    let finalStolenAmount = 0
    let playerState
    let plotAfterSteal

    await prisma.$transaction(async (tx) => {
        const existingStealLog = await tx.stealLog.findUnique({
            where: {
                landPlotId_stealerId_maturityCycleId: {
                    stealerId,
                    landPlotId: targetPlot.id,
                    maturityCycleId: targetPlot.maturityCycleId!
                }
            }
        })
        if (existingStealLog) {
            throw new ApiError(400, AppErrorCodes.ALREADY_STOLEN, "你已经偷过这次的作物了，做人不能太贪心哦！")
        }

        const lockedPlot = await tx.landPlot.findUnique({ where: { id: targetPlot.id } })
        // 【修复】使用 as any 访问 JSON 字段
        const maxCanSteal = plantData.economics.revenue.yield - (lockedPlot?.stolenNum || 0)
        if (maxCanSteal <= 0) {
            throw new ApiError(400, AppErrorCodes.CROP_FULLY_STOLEN, "来晚啦，这块地已经被偷光了！")
        }

        const stolenAmount = Math.max(1, Math.floor(plantData.economics.revenue.yield * 0.1))
        finalStolenAmount = Math.min(stolenAmount, maxCanSteal)

        await tx.stealLog.create({
            data: { landPlotId: targetPlot.id, stealerId, maturityCycleId: targetPlot.maturityCycleId! }
        })
        plotAfterSteal = await tx.landPlot.update({
            where: { id: targetPlot.id },
            data: { stolenNum: { increment: finalStolenAmount } }
        })

        await tx.seedInventory.upsert({
            where: { userId_plantId_itemType: { userId: stealerId, plantId: targetPlot.plantId!, itemType: "FRUIT" } },
            update: { quantity: { increment: finalStolenAmount } },
            create: { userId: stealerId, plantId: targetPlot.plantId!, itemType: "FRUIT", quantity: finalStolenAmount }
        })

        playerState = await getUpdatedPlayerState(stealerId, tx as unknown as Prisma.TransactionClient)
    })

    await logService.createPlayerLog({
        userId: stealerId,
        actionType: ActionType.STEAL,
        targetModel: TargetModel.LANDPLOT,
        targetId: targetPlot.id,
        oldData: targetPlot,
        newData: plotAfterSteal,
        param: `从好友 ${friendId} 的 ${plotIndex} 号地偷取了 ${finalStolenAmount} 个 ${plantData.name}。`
    })

    return {
        steal: {
            plotIndex: targetPlot.plotIndex,
            stolenItem: { itemId: targetPlot.plantId, name: plantData.name, quantity: finalStolenAmount }
        },
        inventory: playerState!.inventory
    }
}

/**
 * 放草
 */
async function placeWeed(currentUserId: number, friendId: number, plotIndex: number): Promise<SabotageFriendResponse> {
    await checkDailyActionLimit(currentUserId, ActionType.SABOTAGE_WEED)
    const targetPlot = await getFriendPlot(currentUserId, friendId, plotIndex)
    if (!targetPlot.plantId) throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "不能在空地上放草。")
    if (targetPlot.hasWeeds) throw new ApiError(400, AppErrorCodes.PLOT_ALREADY_HAS_WEED, "这块地已经长草了。")

    const updatedPlot = await prisma.landPlot.update({
        where: { id: targetPlot.id },
        data: { hasWeeds: true, weedPlacedBy: currentUserId },
        include: { plant: true }
    })

    await logService.createPlayerLog({
        userId: currentUserId,
        actionType: ActionType.SABOTAGE_WEED,
        targetModel: TargetModel.LANDPLOT,
        targetId: updatedPlot.id,
        oldData: targetPlot,
        newData: updatedPlot,
        param: `在好友 ${friendId} 的 ${plotIndex} 号地放了杂草。`
    })

    return {
        plots: [await transformPlotData(updatedPlot)]
    }
}

/**
 * 放虫
 */
async function placePest(currentUserId: number, friendId: number, plotIndex: number): Promise<SabotageFriendResponse> {
    await checkDailyActionLimit(currentUserId, ActionType.SABOTAGE_PEST)
    const targetPlot = await getFriendPlot(currentUserId, friendId, plotIndex)
    if (!targetPlot.plantId) throw new ApiError(400, AppErrorCodes.PLOT_IS_EMPTY, "不能在空地上放虫。")
    if (targetPlot.hasPests) throw new ApiError(400, AppErrorCodes.PLOT_ALREADY_HAS_PEST, "这块地已经有害虫了。")

    const updatedPlot = await prisma.landPlot.update({
        where: { id: targetPlot.id },
        data: { hasPests: true, pestPlacedBy: currentUserId },
        include: { plant: true }
    })

    await logService.createPlayerLog({
        userId: currentUserId,
        actionType: ActionType.SABOTAGE_PEST,
        targetModel: TargetModel.LANDPLOT,
        targetId: updatedPlot.id,
        oldData: targetPlot,
        newData: updatedPlot,
        param: `在好友 ${friendId} 的 ${plotIndex} 号地放了虫子。`
    })

    return {
        plots: [await transformPlotData(updatedPlot)]
    }
}

/**
 * 帮好友除草
 */
async function helpRemoveWeeds(helperId: number, friendId: number, plotIndex: number): Promise<HelpFriendResponse> {
    const targetPlot = await getFriendPlot(helperId, friendId, plotIndex)
    if (!targetPlot.hasWeeds)
        throw new ApiError(400, AppErrorCodes.NO_WEEDS_TO_REMOVE, "这块土地上没有杂草，你的好友很勤劳哦！")
    if (targetPlot.weedPlacedBy === helperId) {
        throw new ApiError(403, AppErrorCodes.CANNOT_HELP_SELF_SABOTAGE, "不能清除自己放置的杂草来获取奖励！")
    }

    const [updatedPlot, playerState] = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: helperId },
            data: { exp: { increment: HELP_INTERACTION_EXP } }
        })
        const plot = await tx.landPlot.update({
            where: { id: targetPlot.id },
            data: { hasWeeds: false, weedPlacedBy: null },
            include: { plant: true }
        })

        const state = await getUpdatedPlayerState(helperId, tx as unknown as Prisma.TransactionClient)
        return [plot, state]
    })

    await logService.createPlayerLog({
        userId: helperId,
        actionType: ActionType.HELP_WEED,
        targetModel: TargetModel.LANDPLOT,
        targetId: updatedPlot.id,
        oldData: targetPlot,
        newData: updatedPlot,
        param: `帮助好友 ${friendId} 的 ${plotIndex} 号地除了草，获得 ${HELP_INTERACTION_EXP} 经验。`
    })

    return {
        plots: [await transformPlotData(updatedPlot)],
        user: playerState.user!
    }
}

/**
 * 帮好友除虫
 */
async function helpRemovePests(helperId: number, friendId: number, plotIndex: number): Promise<HelpFriendResponse> {
    const targetPlot = await getFriendPlot(helperId, friendId, plotIndex)
    if (!targetPlot.hasPests)
        throw new ApiError(400, AppErrorCodes.NO_PESTS_TO_REMOVE, "这块土地上没有害虫，你的好友很勤劳哦！")
    if (targetPlot.pestPlacedBy === helperId) {
        throw new ApiError(403, AppErrorCodes.CANNOT_HELP_SELF_SABOTAGE, "不能清除自己放置的害虫来获取奖励！")
    }

    const [updatedPlot, playerState] = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: helperId },
            data: { exp: { increment: HELP_INTERACTION_EXP } }
        })
        const plot = await tx.landPlot.update({
            where: { id: targetPlot.id },
            data: { hasPests: false, pestPlacedBy: null },
            include: { plant: true }
        })

        const state = await getUpdatedPlayerState(helperId, tx as unknown as Prisma.TransactionClient)
        return [plot, state]
    })

    await logService.createPlayerLog({
        userId: helperId,
        actionType: ActionType.HELP_PEST,
        targetModel: TargetModel.LANDPLOT,
        targetId: updatedPlot.id,
        oldData: targetPlot,
        newData: updatedPlot,
        param: `帮助好友 ${friendId} 的 ${plotIndex} 号地除了虫，获得 ${HELP_INTERACTION_EXP} 经验。`
    })

    return {
        plots: [await transformPlotData(updatedPlot)],
        user: playerState.user!
    }
}

/**
 * 一键偷取好友所有成熟的作物
 */
async function stealFromAllMaturedPlots(stealerId: number, friendId: number): Promise<StealAllResponse> {
    const friendFarm = await getFriendFarmWithPlots(stealerId, friendId)
    const plotsBeforeSteal: LandPlotWithPlant[] = []

    for (const plot of friendFarm.lands) {
        if (plot.plant && plot.plantTime && plot.maturityCycleId) {
            const status = await prisma.landPlot.calculateStatus(plot)
            const plantData = plot.plant as any
            const maxCanSteal = plantData.economics.revenue.yield - plot.stolenNum
            if (status.status === "matured" && maxCanSteal > 0) {
                plotsBeforeSteal.push(plot)
            }
        }
    }

    if (plotsBeforeSteal.length === 0) {
        throw new ApiError(400, AppErrorCodes.NOTHING_TO_HARVEST, "好友的农场里暂时没有可偷的作物。")
    }

    const stealActions: { plot: LandPlotWithPlant; amount: number }[] = []
    for (const plot of plotsBeforeSteal) {
        const existingLog = await prisma.stealLog.findUnique({
            where: {
                landPlotId_stealerId_maturityCycleId: {
                    landPlotId: plot.id,
                    stealerId,
                    maturityCycleId: plot.maturityCycleId!
                }
            }
        })
        if (!existingLog) {
            const plantData = plot.plant as any
            const totalYield = plantData.economics.revenue.yield
            const maxCanSteal = totalYield - plot.stolenNum
            const calculatedStealAmount = Math.max(1, Math.floor(totalYield * 0.1))
            const finalStolenAmount = Math.min(calculatedStealAmount, maxCanSteal)
            if (finalStolenAmount > 0) {
                stealActions.push({ plot, amount: finalStolenAmount })
            }
        }
    }

    if (stealActions.length === 0) {
        throw new ApiError(400, AppErrorCodes.ALREADY_STOLEN, "你已经把所有能偷的都偷过了！")
    }

    let playerState

    await prisma.$transaction(async (tx) => {
        for (const action of stealActions) {
            const { plot, amount } = action
            await tx.stealLog.create({
                data: { landPlotId: plot.id, stealerId, maturityCycleId: plot.maturityCycleId! }
            })
            await tx.landPlot.update({
                where: { id: plot.id },
                data: { stolenNum: { increment: amount } }
            })
            await tx.seedInventory.upsert({
                where: { userId_plantId_itemType: { userId: stealerId, plantId: plot.plantId!, itemType: "FRUIT" } },
                update: { quantity: { increment: amount } },
                create: { userId: stealerId, plantId: plot.plantId!, itemType: "FRUIT", quantity: amount }
            })
        }

        playerState = await getUpdatedPlayerState(stealerId, tx as unknown as Prisma.TransactionClient)
    })

    const stolenPlotIds = stealActions.map((action) => action.plot.id)
    const plotsAfterSteal = await prisma.landPlot.findMany({
        where: { id: { in: stolenPlotIds } }
    })

    const logsToCreate = stealActions.map((action) => {
        const oldPlot = action.plot
        const newPlot = plotsAfterSteal.find((p) => p.id === oldPlot.id)
        return {
            userId: stealerId,
            actionType: ActionType.STEAL,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `从好友 ${friendId} 的 ${oldPlot.plotIndex} 号地偷取了 ${action.amount} 个 ${
                (oldPlot.plant as Plant).name
            }。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId: stealerId,
        actionType: ActionType.STEAL,
        targetModel: TargetModel.FARM,
        targetId: friendFarm.id,
        param: `一键从好友 ${friendId} 的农场偷取了 ${stealActions.length} 块土地的作物。`
    })

    const stolenReport: StealAllResponse["stolenReport"] = {
        summary: { stolenPlotsCount: stealActions.length, totalGains: { items: [] as any[] } },
        details: stealActions.map((action) => ({
            plotIndex: action.plot.plotIndex,
            stolenItem: {
                itemId: action.plot.plantId!,
                name: (action.plot.plant as Plant).name,
                quantity: action.amount
            }
        }))
    }

    const totalGainsMap = new Map<number, { name: string; quantity: number }>()
    stealActions.forEach((action) => {
        const { plot, amount } = action
        const current = totalGainsMap.get(plot.plantId!)
        if (current) {
            current.quantity += amount
        } else {
            totalGainsMap.set(plot.plantId!, { name: (plot.plant as Plant).name, quantity: amount })
        }
    })

    stolenReport.summary.totalGains.items = Array.from(totalGainsMap.entries()).map(([id, data]) => ({
        itemId: id,
        ...data
    }))

    return {
        stolenReport,
        inventory: playerState!.inventory
    }
}

/**
 * 一键在好友农场放草
 */
async function placeWeedOnAllPlots(currentUserId: number, friendId: number): Promise<placeWeedOnAllResponse> {
    const friendFarm = await getFriendFarmWithPlots(currentUserId, friendId)
    const plotsBeforeUpdate = friendFarm.lands.filter((p) => p.plantId && !p.hasWeeds)

    if (plotsBeforeUpdate.length === 0) {
        throw new ApiError(400, AppErrorCodes.PLOT_ALREADY_HAS_WEED, "好友的农场现在没地方可以放草。")
    }

    await checkDailyActionLimit(currentUserId, ActionType.SABOTAGE_WEED, plotsBeforeUpdate.length)

    const targetPlotIds = plotsBeforeUpdate.map((p) => p.id)
    await prisma.landPlot.updateMany({
        where: { id: { in: targetPlotIds } },
        data: { hasWeeds: true, weedPlacedBy: currentUserId }
    })

    const plotsAfterUpdate = await prisma.landPlot.findMany({ where: { id: { in: targetPlotIds } } })

    const logsToCreate = plotsBeforeUpdate.map((oldPlot) => {
        const newPlot = plotsAfterUpdate.find((p) => p.id === oldPlot.id)
        return {
            userId: currentUserId,
            actionType: ActionType.SABOTAGE_WEED,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `在好友 ${friendId} 的 ${oldPlot.plotIndex} 号地放了杂草。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId: currentUserId,
        actionType: ActionType.SABOTAGE_WEED,
        targetModel: TargetModel.FARM,
        targetId: friendFarm.id,
        param: `一键在好友 ${friendId} 的 ${plotsBeforeUpdate.length} 块土地上放了草。`
    })

    return { placedCount: plotsBeforeUpdate.length }
}

/**
 * 一键在好友农场放虫
 */
async function placePestOnAllPlots(currentUserId: number, friendId: number): Promise<placePestOnAllResponse> {
    const friendFarm = await getFriendFarmWithPlots(currentUserId, friendId)
    const plotsBeforeUpdate = friendFarm.lands.filter((p) => p.plantId && !p.hasPests)

    if (plotsBeforeUpdate.length === 0) {
        throw new ApiError(400, AppErrorCodes.PLOT_ALREADY_HAS_PEST, "好友的农场现在没地方可以放虫。")
    }

    await checkDailyActionLimit(currentUserId, ActionType.SABOTAGE_PEST, plotsBeforeUpdate.length)

    const targetPlotIds = plotsBeforeUpdate.map((p) => p.id)
    await prisma.landPlot.updateMany({
        where: { id: { in: targetPlotIds } },
        data: { hasPests: true, pestPlacedBy: currentUserId }
    })

    const plotsAfterUpdate = await prisma.landPlot.findMany({ where: { id: { in: targetPlotIds } } })

    const logsToCreate = plotsBeforeUpdate.map((oldPlot) => {
        const newPlot = plotsAfterUpdate.find((p) => p.id === oldPlot.id)
        return {
            userId: currentUserId,
            actionType: ActionType.SABOTAGE_PEST,
            targetModel: TargetModel.LANDPLOT,
            targetId: oldPlot.id,
            oldData: oldPlot,
            newData: newPlot,
            param: `在好友 ${friendId} 的 ${oldPlot.plotIndex} 号地放了虫子。`
        }
    })
    await logService.createPlayerLogs(logsToCreate as any)

    await logService.createPlayerLog({
        userId: currentUserId,
        actionType: ActionType.SABOTAGE_PEST,
        targetModel: TargetModel.FARM,
        targetId: friendFarm.id,
        param: `一键在好友 ${friendId} 的 ${plotsBeforeUpdate.length} 块土地上放了虫。`
    })

    return { placedCount: plotsBeforeUpdate.length }
}
const friendFarmService = {
    stealFromPlot,
    placeWeed,
    placePest,
    helpRemoveWeeds,
    helpRemovePests,
    stealFromAllMaturedPlots,
    placeWeedOnAllPlots,
    placePestOnAllPlots
}

export default friendFarmService
