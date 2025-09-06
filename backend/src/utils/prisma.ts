// src/utils/prisma.ts

import { PrismaClient } from "@prisma/client"
import type { LandPlot } from "@prisma/client"
import type { GrowthStageName } from "../types/plant.js"
import { ApiError } from "../utils/ApiError.js" // 导入 ApiError
import { AppErrorCodes } from "../utils/errorCodes.js"
// 采用官方推荐的单例模式，以处理开发环境中的热重载问题
const prismaClientSingleton = () => {
    const p = new PrismaClient({
        log: ["query"]
    }).$extends({
        model: {
            // 扩展 LandPlot 模型
            landPlot: {
                async calculateStatus(landPlot: LandPlot) {
                    if (!landPlot.plantId || !landPlot.plantTime) {
                        return {
                            status: "empty",
                            currentStage: null, // 空地没有生长阶段
                            remainingSeconds: 0,
                            growthPercentage: 0
                        }
                    }
                    const plant = await p.plant.findUnique({ where: { id: landPlot.plantId } })
                    if (!plant)
                        throw new ApiError(500, AppErrorCodes.INTERNAL_SERVER_ERROR, `种子 ${landPlot.plantId} 丢失`)

                    const growthData = plant.growth
                    const totalSeconds = growthData.totalSeconds
                    const elapsedTime = (new Date().getTime() - landPlot.plantTime.getTime()) / 1000

                    if (elapsedTime >= totalSeconds) {
                        return {
                            status: "matured",
                            currentStage: "initialMaturity", // 已成熟，通常是最后一个阶段
                            remainingSeconds: 0,
                            growthPercentage: 100
                        }
                    }

                    // 【核心修改】查找当前所处的生长阶段
                    let currentStage: GrowthStageName = "germination" // 默认是发芽期
                    for (const stage of growthData.stages) {
                        if (elapsedTime < stage.endSeconds) {
                            currentStage = stage.name
                            break // 找到第一个未达到的阶段就跳出循环
                        }
                    }

                    const remainingSeconds = Math.round(totalSeconds - elapsedTime)
                    const growthPercentage = Math.floor((elapsedTime / totalSeconds) * 100)

                    return {
                        status: "growing",
                        currentStage: currentStage, // 返回当前阶段名称
                        remainingSeconds: remainingSeconds,
                        growthPercentage: growthPercentage
                    }
                }
            }
        }
    })
    return p
}

// 声明一个全局类型，用于缓存 Prisma 实例
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

// 导出唯一的 Prisma 实例
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

const plant = await prisma.plant.findUnique({ where: { id: 1 } })
if (plant) {
    plant.efficiency
}
export default prisma

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
} /*
        : {
          needs: { plantTime: true, plantId: true },
          compute(landPlot): CalculatedCropStatus {

            
            // --- 核心修复部分 ---
            // 直接将 landPlot.plant.growth 断言为我们需要的 Growth 类型
            
        }*/
