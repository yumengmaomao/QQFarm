import express, { Router } from "express"
import friendFarmService from "../services/friendFarm.js"
import { isAuthenticated } from "../middleware/auth.js"
import { friendIdParamValidate, friendPlotParamsValidate } from "@qqfarm/shared-validators"

const router: Router = express.Router()

// 对此路由下的所有请求应用身份验证中间件
router.use(isAuthenticated)

/**
 * @route   POST /api/friends/:friendId/farm/plots/:plotIndex/steal
 * @desc    从好友的指定地块偷取作物
 * @access  Private
 */
router.post("/:friendId/farm/plots/:plotIndex/steal", async (req, res, next) => {
    try {
        const { friendId, plotIndex } = friendPlotParamsValidate.parse(req.params)
        const stealerId = req.user.userId

        const result = await friendFarmService.stealFromPlot(stealerId, friendId, plotIndex)

        res.success(result, `成功从好友 ${friendId} 的地块 ${plotIndex} 偷取作物！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/plots/:plotIndex/sabotage/weed
 * @desc    在好友的指定地块上放草
 * @access  Private
 */
router.post("/:friendId/farm/plots/:plotIndex/sabotage/weed", async (req, res, next) => {
    try {
        const { friendId, plotIndex } = friendPlotParamsValidate.parse(req.params)
        const currentUserId = req.user.userId

        const plot = await friendFarmService.placeWeed(currentUserId, friendId, plotIndex)

        res.success(plot, `成功在好友 ${friendId} 的地块 ${plotIndex} 上放了杂草。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/plots/:plotIndex/sabotage/pest
 * @desc    在好友的指定地块上放虫
 * @access  Private
 */
router.post("/:friendId/farm/plots/:plotIndex/sabotage/pest", async (req, res, next) => {
    try {
        const { friendId, plotIndex } = friendPlotParamsValidate.parse(req.params)
        const currentUserId = req.user.userId

        const plot = await friendFarmService.placePest(currentUserId, friendId, plotIndex)

        res.success(plot, `成功在好友 ${friendId} 的地块 ${plotIndex} 上放了害虫。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/plots/:plotIndex/help/remove-weed
 * @desc    帮助好友的指定地块除草
 * @access  Private
 */
router.post("/:friendId/farm/plots/:plotIndex/help/remove-weed", async (req, res, next) => {
    try {
        const { friendId, plotIndex } = friendPlotParamsValidate.parse(req.params)
        const helperId = req.user.userId

        const plot = await friendFarmService.helpRemoveWeeds(helperId, friendId, plotIndex)

        res.success(plot, `成功帮助好友 ${friendId} 的地块 ${plotIndex} 除草！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/plots/:plotIndex/help/remove-pest
 * @desc    帮助好友的指定地块除虫
 * @access  Private
 */
router.post("/:friendId/farm/plots/:plotIndex/help/remove-pest", async (req, res, next) => {
    try {
        const { friendId, plotIndex } = friendPlotParamsValidate.parse(req.params)
        const helperId = req.user.userId

        const plot = await friendFarmService.helpRemovePests(helperId, friendId, plotIndex)

        res.success(plot, `成功帮助好友 ${friendId} 的地块 ${plotIndex} 除虫！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/steal-all
 * @desc    一键偷取好友所有可偷的作物
 * @access  Private
 */
router.post("/:friendId/farm/steal-all", async (req, res, next) => {
    try {
        const { friendId } = friendIdParamValidate.parse(req.params)
        const stealerId = req.user.userId
        const result = await friendFarmService.stealFromAllMaturedPlots(stealerId, friendId)
        res.success(result, `一键偷取成功！共光顾了 ${result.stolenReport.summary.stolenPlotsCount} 块土地。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/sabotage/weed-all
 * @desc    一键在好友所有可操作的地块上放草
 * @access  Private
 */
router.post("/:friendId/farm/sabotage/weed-all", async (req, res, next) => {
    try {
        const { friendId } = friendIdParamValidate.parse(req.params)
        const currentUserId = req.user.userId
        const result = await friendFarmService.placeWeedOnAllPlots(currentUserId, friendId)
        res.success(result, `成功在好友农场的 ${result.placedCount} 块土地上放了杂草！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/friends/:friendId/farm/sabotage/pest-all
 * @desc    一键在好友所有可操作的地块上放虫
 * @access  Private
 */
router.post("/:friendId/farm/sabotage/pest-all", async (req, res, next) => {
    try {
        const { friendId } = friendIdParamValidate.parse(req.params)
        const currentUserId = req.user.userId
        const result = await friendFarmService.placePestOnAllPlots(currentUserId, friendId)
        res.success(result, `成功在好友农场的 ${result.placedCount} 块土地上放了害虫！`)
    } catch (error) {
        next(error)
    }
})

export default router
