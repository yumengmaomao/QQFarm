import prisma from "../utils/prisma.js"
import type { PlayerLogData } from "../types/index.js"
import { getLogger } from "../utils/logger.js"

const logger = getLogger("LogService")

/**
 * 创建一条玩家行为日志。
 * 这是一个可复用的函数，可以在任何需要记录操作的地方调用。
 * @param logData - 包含日志所需信息的对象
 */
async function createPlayerLog(logData: PlayerLogData) {
  try {
    await prisma.playerLog.create({
      data: {
        userId: logData.userId,
        actionType: logData.actionType,
        timestamp: new Date(),
        targetModel: logData.targetModel,
        targetId: logData.targetId ?? null,
        param: logData.param ?? null,
        oldData: logData.oldData ?? null,
        newData: logData.newData ?? null
      }
    })
  } catch (error: any) {
    logger.error(`创建玩家日志失败: ${error.message}`, { logData })
  }
}
async function createPlayerLogs(logDataArray: PlayerLogData[]) {
  if (logDataArray.length === 0) {
    return
  }

  try {
    const dataToCreate = logDataArray.map((logData) => ({
      userId: logData.userId,
      actionType: logData.actionType,
      targetModel: logData.targetModel,
      targetId: logData.targetId ?? null,
      param: logData.param ?? null,
      oldData: logData.oldData ?? null,
      newData: logData.newData ?? null
    }))

    await prisma.playerLog.createMany({
      data: dataToCreate,
      skipDuplicates: true // 可选：如果遇到唯一约束冲突，则跳过该条记录而不是报错
    })
  } catch (error: any) {
    logger.error(`批量创建玩家日志失败: ${error.message}`, { count: logDataArray.length })
  }
}
const logService = {
  createPlayerLog,
  createPlayerLogs
}

export default logService
