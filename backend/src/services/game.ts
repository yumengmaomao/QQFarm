import prisma from "../utils/prisma.js"
import { getLogger } from "../utils/logger.js"

const logger = getLogger("GameService")
async function initializeNewUserGameData(userId: number) {
    try {
        logger.info(`开始初始化新用户: ${userId} 的农场数据`)
        prisma.$transaction(async (cxt) => {
            const farm = await cxt.farm.create({
                data: {
                    userId: userId
                }
            })
            const plot = await cxt.landPlot.createMany({
                data: [
                    { farmId: farm.id, plotIndex: 1 },
                    { farmId: farm.id, plotIndex: 2 },
                    { farmId: farm.id, plotIndex: 3 },
                    { farmId: farm.id, plotIndex: 4 },
                    { farmId: farm.id, plotIndex: 5 }
                ]
            })
            await cxt.seedInventory.create({
                data: {
                    userId: userId,
                    plantId: 1,
                    quantity: 10,
                    itemType: "SEED"
                }
            })
            logger.info(`用户: ${userId} 农场数据初始化完成`)
        })
    } catch (error) {
        logger.error(`用户: ${userId} 农场数据初始化失败`, error)
        throw error
    }
}
const gameService = {
    initializeNewUserGameData
}

export default gameService
