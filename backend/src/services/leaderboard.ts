import prisma from "../utils/prisma.js"
import { getLogger } from "../utils/logger.js"
import { LeaderboardType, type LeaderboardEntry, type LeaderboardResponse } from "@qqfarm/shared-types"
import { Prisma, ActionType } from "@prisma/client"

const logger = getLogger("LeaderboardService")

// --- 缓存实现 ---
// 使用一个简单的内存 Map 作为缓存
const cache = new Map<string, { data: LeaderboardResponse; expiry: number }>()
// 缓存有效期（秒），例如 5 分钟
const CACHE_DURATION_SECONDS = 300

/**
 * 获取指定类型的排行榜数据。
 * 该函数现在会从 PlayerLog 表实时计算统计数据，并使用缓存来优化性能。
 * @param type - 排行榜类型
 * @param limit - 每页返回的条目数
 * @param offset - 查询的起始偏移量
 */
async function getLeaderboard(type: LeaderboardType, limit: number, offset: number): Promise<LeaderboardResponse> {
    const cacheKey = `${type}-${limit}-${offset}`
    const cachedItem = cache.get(cacheKey)

    // 1. 检查缓存
    if (cachedItem && cachedItem.expiry > Date.now()) {
        logger.debug(`命中缓存: ${cacheKey}`)
        return cachedItem.data
    }

    logger.debug(`缓存未命中或已过期: ${cacheKey}`)

    let entries: LeaderboardEntry[] = []

    // 2. 根据排行榜类型从数据库查询
    if (type === LeaderboardType.WEALTH || type === LeaderboardType.LEVEL) {
        // 对于财富和等级榜，直接查询 User 表效率更高
        const orderBy =
            type === LeaderboardType.WEALTH
                ? { gold: "desc" }
                : ([{ level: "desc" }, { exp: "desc" }] as Prisma.UserOrderByWithRelationInput)

        const users = await prisma.user.findMany({
            // @ts-expect-error
            orderBy,
            take: limit,
            skip: offset
        })

        entries = users.map((user, index) => ({
            rank: offset + index + 1,
            userId: user.id,
            nickName: user.nickName,
            level: user.level,
            value: (type === LeaderboardType.WEALTH ? user.gold : user.level).toString()
        }))
    } else {
        // 对于统计类排行榜，从 PlayerLog 表聚合计算
        let actionTypes: ActionType[] = []
        switch (type) {
            case LeaderboardType.STEAL_COUNT:
                actionTypes = [ActionType.STEAL]
                break
            case LeaderboardType.HARVEST_COUNT:
                actionTypes = [ActionType.HARVEST]
                break
            case LeaderboardType.SABOTAGE_COUNT:
                actionTypes = [ActionType.SABOTAGE_PEST, ActionType.SABOTAGE_WEED]
                break
            case LeaderboardType.HELP_COUNT:
                actionTypes = [ActionType.HELP_PEST, ActionType.HELP_WEED]
                break
        }

        // a. 分组计数
        const results = await prisma.playerLog.groupBy({
            by: ["userId"],
            where: { actionType: { in: actionTypes } },
            _count: { userId: true },
            orderBy: { _count: { userId: "desc" } },
            take: limit,
            skip: offset
        })

        if (results.length > 0) {
            // b. 获取这些用户的详细信息
            const userIds = results.map((r) => r.userId)
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, nickName: true, level: true }
            })
            const userMap = new Map(users.map((u) => [u.id, u]))

            // c. 合并数据
            entries = results.map((result, index) => {
                const user = userMap.get(result.userId)
                return {
                    rank: offset + index + 1,
                    userId: result.userId,
                    nickName: user?.nickName || "未知用户",
                    level: user?.level || 0,
                    value: result._count.userId.toString()
                }
            })
        }
    }

    const leaderboardData: LeaderboardResponse = { type, entries }

    // 3. 存储结果到缓存
    cache.set(cacheKey, {
        data: leaderboardData,
        expiry: Date.now() + CACHE_DURATION_SECONDS * 1000
    })

    return leaderboardData
}

const leaderboardService = {
    getLeaderboard
}

export default leaderboardService
