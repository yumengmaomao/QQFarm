import * as z from "zod"
import { ItemType } from "@prisma/client"

/**
 * 验证购买物品的请求体。
 * - `itemType`: 只能是 "SEED" 或 "PROP"，因为只有这两类物品可以从商店购买。
 */
export const buyItemBodyValidate = z.object({
    itemType: z.enum(["SEED", "PROP"], {
        error: (issue) => (issue.code === "invalid_value" ? "无效的购买物品类型" : "物品类型不能为空")
    }),
    itemId: z
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "物品ID不能为空" : "物品ID必须是数字")
        })
        .int({
            error: "物品ID必须是整数"
        })
        .positive({
            error: "无效的物品ID"
        }),
    quantity: z
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "购买数量不能为空" : "购买数量必须是数字")
        })
        .int({
            error: "购买数量必须是整数"
        })
        .max(99, {
            error: "购买数量最多是99个"
        })
        .min(1, {
            error: "你要买0个？？"
        })
        .positive({
            error: "购买数量必须是正整数"
        })
})

/**
 * 验证出售物品的请求体。
 * - `itemType`: 可以是 "SEED", "FRUIT", 或 "PROP"，因为这三类都可以出售。
 * 我们使用 `z.nativeEnum(ItemType)` 来确保值与 Prisma 的 `ItemType` 枚举完全匹配。
 */
export const sellItemBodyValidate = z.object({
    itemType: z.enum(ItemType, {
        error: (issue) => (issue.code === "invalid_value" ? "无效的物品类型" : "物品类型不能为空")
    }),
    itemId: z
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "物品ID不能为空" : "物品ID必须是数字")
        })
        .int({
            error: "物品ID必须是整数"
        })
        .positive({
            error: "无效的物品ID"
        }),
    quantity: z
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "出售数量不能为空" : "出售数量必须是数字")
        })
        .int({
            error: "出售数量必须是整数"
        })
        .max(999, {
            error: "出售数量最多是999个"
        })
        .min(1, {
            error: "你要卖0个？？"
        })
        .positive({
            error: "出售数量必须是正整数"
        })
})
