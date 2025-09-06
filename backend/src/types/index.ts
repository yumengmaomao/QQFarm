import { type PlayerLog, Prisma } from "@prisma/client"
import { getUpdatedPlayerState } from "../utils/helpers.js"
/**
 * API 响应的通用结构
 * @template T - data 字段的类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  error?: string
}
export type PlayerLogData = {
  // --- 必需的字段 ---
  userId: PlayerLog["userId"]
  actionType: PlayerLog["actionType"]
  targetModel: PlayerLog["targetModel"]

  // --- 可选的字段 ---
  targetId?: PlayerLog["targetId"]
  oldData?: PlayerLog["oldData"]
  newData?: PlayerLog["newData"]
  param?: PlayerLog["param"]
}
const landPlotWithPlant = Prisma.validator<Prisma.LandPlotDefaultArgs>()({
  include: {
    plant: true
  }
})
// 使用我们定义的“形状”来生成精确的返回类型
export type LandPlotWithPlant = Prisma.LandPlotGetPayload<typeof landPlotWithPlant>
export type getPlayerState = Awaited<ReturnType<typeof getUpdatedPlayerState>>
