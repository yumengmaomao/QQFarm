// packages/shared-types/src/core.ts
export type GrowthStageName = "germination" | "leaflet" | "largeleaf" | "initialMaturity"
import { ItemType, PropType } from "@prisma/client"

/**
 * 核心模型：代表玩家的核心属性。
 */
export interface UserState {
    id: number
    nickName: string
    level: number
    exp: number
    expToNextLevel: number
    gold: string // BigInt 从后端传来时序列化为字符串
    premiumCurrency: number
    avatar?: string // 玩家头像URL
}

/**
 * 核心模型：代表背包中的一个物品堆叠。
 */
export interface InventoryItem {
    itemId: number
    name: string
    quantity: number
}

export type PropInventoryState = Partial<Record<PropType, InventoryItem[]>>

/**
 * 描述玩家的完整背包。
 */
export interface InventoryState {
    seeds: InventoryItem[]
    fruits: InventoryItem[]
    props: PropInventoryState
}
/**
 * 核心模型：代表单个地块的完整状态。
 */
export interface PlotState {
    id: number
    plotIndex: number
    plant: {
        id: number
        name: string
        image: string | null
    } | null
    status: "empty" | "growing" | "matured"
    currentStage: GrowthStageName | null
    growthPercentage: number
    remainingSeconds: number
    waterState: number
    fertilizerState: number
    hasWeeds: boolean
    hasPests: boolean
    stolenNum: number
}

// 定义商店中单个商品的统一结构
export interface ShopListingItem {
    itemId: number
    name: string
    itemType: ItemType // SEED 或 PROP
    buyPrice: string // 使用字符串以兼容 BigInt
    requiredLevel: number
    description: string
    image?: string | null
}

// 定义商店商品列表的整体结构
export interface ShopListings {
    seeds: ShopListingItem[]
    props: ShopListingItem[]
}
/**
 * 排行榜的类型标识符。
 * 'wealth': 按金币数量排名
 * 'level': 按玩家等级排名
 * 'steal_count': 按偷菜总数排名
 * 'harvest_count': 按收获作物总数排名
 * 'sabotage_count': 按捣蛋总次数排名
 * 'help_count': 按帮助好友总次数排名
 */
export enum LeaderboardType {
    WEALTH = "wealth",
    LEVEL = "level",
    STEAL_COUNT = "steal_count",
    HARVEST_COUNT = "harvest_count",
    SABOTAGE_COUNT = "sabotage_count",
    HELP_COUNT = "help_count"
}

/**
 * 描述排行榜上单个玩家条目的数据结构。
 */
export interface LeaderboardEntry {
    rank: number
    userId: number
    nickName: string
    level: number
    value: string // 使用字符串以安全地表示 BigInt (如财富) 或 number (如等级)
}
