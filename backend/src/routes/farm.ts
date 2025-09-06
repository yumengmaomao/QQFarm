import express, { Router } from "express"
import plotService from "../services/plot.js"
import farmBatchService from "../services/farm.js" // 导入新的农场批量服务
import { isAuthenticated } from "../middleware/auth.js"
import { plotIndexParamValidate, plantIdBodyValidate, fertilizeBodyValidate } from "@qqfarm/shared-validators"
const router: Router = express.Router()

// 对此路由下的所有请求应用身份验证中间件
router.use(isAuthenticated)

/**
 * @route   POST /api/farm/plots/:plotIndex/plant
 * @desc    在指定地块上种植作物
 * @access  Private
 */
router.post("/plots/:plotIndex/plant", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { plantId } = plantIdBodyValidate.parse(req.body)
        const { userId, farmId } = req.user

        const plot = await plotService.plantPlot(userId, farmId, plotIndex, plantId)

        res.success(plot, `在地块 ${plotIndex} 上成功种植！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/:plotIndex/harvest
 * @desc    收获指定地块的作物
 * @access  Private
 */
router.post("/plots/:plotIndex/harvest", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { userId, farmId } = req.user // 【修复】获取 farmId

        const result = await plotService.harvestPlot(userId, farmId, plotIndex) // 【修复】传入 farmId

        res.success(result, `成功收获地块 ${plotIndex}！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/:plotIndex/water
 * @desc    给指定地块浇水
 * @access  Private
 */
router.post("/plots/:plotIndex/water", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { userId, farmId } = req.user // 【修复】获取 farmId

        const plot = await plotService.waterPlot(userId, farmId, plotIndex) // 【修复】传入 farmId

        res.success(plot, `已为地块 ${plotIndex} 浇水。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/:plotIndex/fertilize
 * @desc    给指定地块施肥
 * @access  Private
 */
router.post("/plots/:plotIndex/fertilize", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { reduction } = fertilizeBodyValidate.parse(req.body)
        const { userId, farmId } = req.user // 【修复】获取 farmId

        const plot = await plotService.fertilizePlot(userId, farmId, plotIndex, reduction) // 【修复】传入 farmId

        res.success(plot, `已为地块 ${plotIndex} 施肥。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/:plotIndex/remove-weeds
 * @desc    为指定地块除草
 * @access  Private
 */
router.post("/plots/:plotIndex/remove-weeds", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { userId, farmId } = req.user // 【修复】获取 farmId

        const plot = await plotService.removeWeeds(userId, farmId, plotIndex) // 【修复】传入 farmId

        res.success(plot, `已为地块 ${plotIndex} 清除杂草。`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/:plotIndex/remove-pests
 * @desc    为指定地块除虫
 * @access  Private
 */
router.post("/plots/:plotIndex/remove-pests", async (req, res, next) => {
    try {
        const { plotIndex } = plotIndexParamValidate.parse(req.params)
        const { userId, farmId } = req.user // 【修复】获取 farmId

        const plot = await plotService.removePests(userId, farmId, plotIndex) // 【修复】传入 farmId

        res.success(plot, `已为地块 ${plotIndex} 清除害虫。`)
    } catch (error) {
        next(error)
    }
})
/**
 * @route   POST /api/farm/plots/harvest-all
 * @desc    一键收获所有成熟的作物
 * @access  Private
 */
router.post("/plots/harvest-all", async (req, res, next) => {
    try {
        const result = await farmBatchService.harvestAllMaturedPlots(req.user.userId)
        // 【修复】访问正确的响应结构
        res.success(result, `一键收获了 ${result.harvestReport.summary.harvestedPlotsCount} 块土地！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/water-all
 * @desc    一键为所有干旱地块浇水
 * @access  Private
 */
router.post("/plots/water-all", async (req, res, next) => {
    try {
        const result = await farmBatchService.waterAllDryPlots(req.user.userId)
        // 【修复】访问正确的响应结构
        res.success(result, `一键为 ${result.result.wateredCount} 块土地浇了水！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/remove-weeds-all
 * @desc    一键清除所有杂草
 * @access  Private
 */
router.post("/plots/remove-weeds-all", async (req, res, next) => {
    try {
        const result = await farmBatchService.removeAllWeeds(req.user.userId)
        // 【修复】访问正确的响应结构
        res.success(result, `一键清除了 ${result.result.removedCount} 塊土地的雜草！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/remove-pests-all
 * @desc    一键清除所有害虫
 * @access  Private
 */
router.post("/plots/remove-pests-all", async (req, res, next) => {
    try {
        const result = await farmBatchService.removeAllPests(req.user.userId)
        // 【修复】访问正确的响应结构
        res.success(result, `一键清除了 ${result.result.removedCount} 塊土地的害虫！`)
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/farm/plots/plant-all
 * @desc    一键在所有空地种植指定作物
 * @access  Private
 */
router.post("/plots/plant-all", async (req, res, next) => {
    try {
        const { plantId } = plantIdBodyValidate.parse(req.body)
        const { userId, farmId } = req.user // 【修复】获取 farmId
        const result = await farmBatchService.plantAllEmptyPlots(userId, farmId, plantId) // 【修复】传入 farmId
        // 【修复】访问正确的响应结构
        res.success(result, `一键种植了 ${result.plantReport.plantCount} 块土地！`)
    } catch (error) {
        next(error)
    }
})

export default router
