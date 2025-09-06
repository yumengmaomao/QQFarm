import express, { Router } from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { LeaderboardQueryValidate } from "@qqfarm/shared-validators" // 从共享包导入验证器
import leaderboardService from "../services/leaderboard.js"

const router: Router = express.Router()

// 对此路由下的所有请求应用身份验证中间件
router.use(isAuthenticated)

/**
 * @route   GET /api/leaderboard
 * @desc    获取指定类型的排行榜
 * @access  Private
 * @query   type: 'wealth' | 'level' | 'steal_count' | ...
 * @query   limit?: number
 * @query   offset?: number
 */
router.get("/", async (req, res, next) => {
    try {
        // 1. 使用 Zod 验证查询参数
        const { type, limit, offset } = LeaderboardQueryValidate.parse(req.query)

        // 2. 调用服务层函数获取排行榜数据
        const leaderboardData = await leaderboardService.getLeaderboard(type, limit, offset)

        // 3. 发送成功响应
        res.success(leaderboardData, `成功获取 ${type} 排行榜。`)
    } catch (error) {
        // 如果验证失败或服务出错，交由错误处理中间件处理
        console.log("error :>> ", error)
        next(error)
    }
})

export default router
