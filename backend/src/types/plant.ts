// src/types/gameData.ts

/**
 * 定义购买成本的结构。
 */
export interface Cost {
    gold: number
    premium: number
}

/**
 * 定义预期收入的结构。
 */
export interface Revenue {
    sellPricePerUnit: number
    yield: number
    totalSellPrice: number
}
/**
 * 定义土地上作物生长状态的计算结果结构。
 */
export interface CalculatedCropStatus {
    /**
     * 当前的状态: 'empty', 'growing', 'matured', 'withered'
     */
    status: "empty" | "growing" | "matured" | "withered"

    /**
     * 距离完全成熟还需要的秒数。
     * 如果已成熟或为空，则为 0。
     */
    remainingSeconds: number

    /**
     * 生长进度的百分比 (0 到 100)。
     */
    growthPercentage: number
}
/**
 * 定义与经济学相关的数值结构。
 */
export interface Economics {
    cost: Cost
    revenue: Revenue
    netProfit: number
}
/**
 * 定义植物生长阶段的名称。
 * 这是一个联合类型，只允许特定的阶段名称。
 */
export type GrowthStageName = "germination" | "leaflet" | "largeleaf" | "initialMaturity"
/**
 * 定义植物单个生长阶段的结构。
 */
export interface GrowthStage {
    name: GrowthStageName
    endSeconds: number
}

/**
 * 定义与生长周期相关信息的结构。
 */
export interface Growth {
    totalSeconds: number
    stages: GrowthStage[]
}

/**
 * 定义收获时可获得的奖励结构。
 */
export interface Rewards {
    exp: number
}

/**
 * 定义预先计算的效率指标结构。
 */
export interface Efficiency {
    profitPerHour: number
    expPerHour: number
}

/**
 * 定义与物品相关的限制条件结构。
 */
export interface Limits {
    harvestsPerSeed: number
    dailyPurchase: number
}

/**
 * 定义完整的植物/花卉对象的权威类型。
 * 这个类型是根据 farm_plant_data_categorized.json 文件的结构生成的。
 */
export interface Plant {
    /**
     * 物品在游戏中的唯一ID。
     */
    id: number

    /**
     * 物品的显示名称，例如 "白萝卜"。
     */
    name: string

    /**
     * 物品的分类，明确其稀有度和大类。
     */
    itemType: "普通作物" | "稀有作物" | "普通鲜花" | "稀有鲜花"

    /**
     * 用于前端显示的图片ID或路径，可能为空。
     */
    image: string | null

    /**
     * 种植或购买此物品所需的最低玩家等级。
     */
    requiredLevel: number

    /**
     * 游戏内部的子分类，例如 "蔬菜Ⅲ"，可能为空。
     */
    category: string | null

    /**
     * 包含所有经济学相关数值的对象。
     */
    economics: Economics

    /**
     * 包含所有生长周期相关信息的对象。
     */
    growth: Growth

    /**
     * 包含所有收获奖励信息的对象。
     */
    rewards: Rewards

    /**
     * 包含所有效率指标的对象。
     */
    efficiency: Efficiency

    /**
     * 包含所有限制条件信息的对象。
     */
    limits: Limits
}
/**
 * @interface FertilizerEffect
 * @description 用于肥料的效果，可以减少作物的生长时间。
 * @property {'fertilizer'} type - 可辨识符。
 * @property {number} value - 减少的时间数值。
 * @property {'seconds' | 'percentage'} unit - 减少值的单位（秒或百分比）。
 */
export interface FertilizerEffect {
    type: "fertilizer"
    value: number
    unit: "seconds" | "percentage"
}

/**
 * @interface StatusBuffEffect
 * @description 用于给玩家提供临时状态增益（Buff）的效果。
 * @property {'statusBuff'} type - 可辨识符。
 * @property {'doubleExp' | 'harvestBoost'} buff - 具体的增益效果标识符。
 * @property {number} duration - 增益效果的持续时间。
 * @property {'seconds'} unit - 持续时间的单位。
 */
export interface StatusBuffEffect {
    type: "statusBuff"
    buff: "doubleExp" | "harvestBoost" // 您可以在这里添加更多增益类型
    duration: number
    unit: "seconds"
}

/**
 * @interface PlacementEffect
 * @description 用于可作为装饰品放置的物品的效果。
 * @property {'placement'} type - 可辨识符。
 * @property {'farm' | 'house'} area - 物品可以被放置的区域。
 */
export interface PlacementEffect {
    type: "placement"
    area: "farm" | "house" // 您可以扩展更多可放置区域
}

/**
 * @interface UnlockEffect
 * @description 用于解锁游戏特性或物品的特殊效果。
 * @property {'unlock'} type - 可辨识符。
 * @property {'landPlot' | 'premiumFeature'} target - 此物品解锁的目标。
 */
export interface UnlockEffect {
    type: "unlock"
    target: "landPlot" | "premiumFeature"
}

export type PropEffect = FertilizerEffect | StatusBuffEffect | PlacementEffect | UnlockEffect
declare global {
    namespace PrismaJson {
        type PlantEconomics = Economics
        type PlantGrowth = Growth
        type PlantRewards = Rewards
        type PlantEfficiency = Efficiency
        type PlantLimits = Limits
    }
}
