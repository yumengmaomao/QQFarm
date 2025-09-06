import express, { Router } from "express"
import { isAuthenticated } from "../middleware/auth.js"
import shopService from "../services/shop.js"
import { buyItemBodyValidate, sellItemBodyValidate } from "@qqfarm/shared-validators"

const router: Router = express.Router()

router.use(isAuthenticated)

/**
 * @route   GET /api/shop/listings
 * @desc    获取商店中所有可购买的商品
 * @access  Private
 */
router.get("/listings", async (req, res, next) => {
    try {
        const listings = await shopService.getShopListings()
        res.success(listings, "成功获取商店列表。")
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/shop/buy
 * @desc    购买指定的商品
 * @access  Private
 */
router.post("/buy", async (req, res, next) => {
    try {
        const { itemType, itemId, quantity } = buyItemBodyValidate.parse(req.body)
        const { userId } = req.user

        const result = await shopService.buyItem(userId, itemType, itemId, quantity)
        res.success(result, "购买成功！")
    } catch (error) {
        next(error)
    }
})

/**
 * @route   POST /api/shop/sell
 * @desc    出售指定的商品
 * @access  Private
 */
router.post("/sell", async (req, res, next) => {
    try {
        const { itemType, itemId, quantity } = sellItemBodyValidate.parse(req.body)
        const { userId } = req.user

        const result = await shopService.sellItem(userId, itemType, itemId, quantity)
        res.success(result, "出售成功！")
    } catch (error) {
        next(error)
    }
})

export default router
