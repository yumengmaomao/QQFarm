// packages/shared-types/src/api-responses.ts
import type { UserState, InventoryState, PlotState, InventoryItem, LeaderboardType, LeaderboardEntry } from "./core.js"

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T> {
    code: number
    message: string
    data?: T
    error?: string
}

// ==============================================================================
// 认证 (Auth)
// ==============================================================================
export type LoginResponse = {
    accessToken: string
    refreshToken: string
}

export type SignupResponse = {
    id: number
    nickName: string
}

// ==============================================================================
// 自己的农场操作 (Farm)
// ==============================================================================

export type FarmInteractionResponse = {
    plots: PlotState[]
    user: UserState
}
export type WaterPlotResponse = {
    plots: PlotState
    user: UserState
}
export type RemovePestsPlotResponse = {
    plots: PlotState
    user: UserState
}
export type RemoveWeedsPlotResponse = {
    plots: PlotState
    user: UserState
}
export type FertilizePlotResponse = {
    plots: PlotState
    user: UserState
    inventory: InventoryState
}
export type PlantPlotResponse = {
    plots: PlotState
    inventory: InventoryState
}

export type HarvestPlotResponse = {
    hrvest: {
        plotIndex: number
        gains: {
            exp: number
            item: InventoryItem
        }
    }
    user: UserState
    inventory: InventoryState
}

// ==============================================================================
// 好友农场互动 (Friend Farm)
// ==============================================================================
export type StealPlotResponse = {
    steal: {
        plotIndex: number
        stolenItem: InventoryItem
    }

    inventory: InventoryState
}

export type HelpFriendResponse = {
    plots: PlotState[] // 好友的地块
    user: UserState // 自己的用户状态
}

// ==============================================================================
// 一键批量操作 (Batch Actions)
// ==============================================================================
export type HarvestAllResponse = {
    harvestReport: {
        summary: {
            harvestedPlotsCount: number
            totalGains: {
                totalexp: number
                totalitems: InventoryItem[]
            }
        }
        details: {
            plotIndex: number
            gains: {
                exp: number
                item: InventoryItem
            }
        }[]
    }
    plots: PlotState[]
    user: UserState
    inventory: InventoryState
}

export type plantAllResponse = {
    plantReport: {
        plantCount: number
    }
    plots: PlotState[]
    inventory: InventoryState
}

export type StealAllResponse = {
    stolenReport: {
        summary: {
            stolenPlotsCount: number
            totalGains: {
                items: InventoryItem[]
            }
        }
        details: {
            plotIndex: number
            stolenItem: InventoryItem
        }[]
    }

    inventory: InventoryState[]
}

export type WaterAllResponse = {
    result: {
        wateredCount: number
        gainedExp: number
    }
    user: UserState
}
export type removeAllPestsResponse = {
    result: {
        removedCount: number
        gainedExp: number
    }
    user: UserState
}
export type removeAllWeedsResponse = {
    result: {
        removedCount: number
        gainedExp: number
    }
    user: UserState
}
export type ShopActionResponse = {
    user: UserState
    inventory: InventoryState
}
export type placeWeedOnAllResponse = {
    placedCount: number
}
export type placePestOnAllResponse = {
    placedCount: number
}
export type SabotageFriendResponse = {
    plots: PlotState[]
}

/**
 * 描述一个完整的排行榜 API 响应。
 */
export interface LeaderboardResponse {
    type: LeaderboardType
    entries: LeaderboardEntry[]
}
