import express, { Router } from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { getLogger } from "../utils/logger.js"
import friendsService from "../services/friends.js"
import { sendFriendRequestValidate, respondToRequestValidate, deleteFriendValidate } from "@qqfarm/shared-validators"
import { FriendRequestStatus } from "@prisma/client"

const logger = getLogger("FriendsRoute")
const router: Router = express.Router()

// 对此路由下的所有请求应用身份验证中间件
router.use(isAuthenticated)

// ==============================================================================
// 1. 获取好友列表和请求
// ==============================================================================

/**
 * @route   GET /api/friends
 * @desc    获取当前用户的好友列表 (已接受的)
 * @access  Private
 */
router.get("/", async (req, res, next) => {
    try {
        const currentUserId = req.user!.userId
        const friendsList = await friendsService.listFriends(currentUserId)
        res.success(friendsList, "成功获取好友列表。")
    } catch (error: any) {
        logger.error(`获取好友列表失败: ${error.message}`)
        next(error)
    }
})

/**
 * @route   GET /api/friends/requests/pending
 * @desc    获取当前用户收到的待处理好友请求
 * @access  Private
 */
router.get("/requests/pending", async (req, res, next) => {
    try {
        const currentUserId = req.user!.userId
        const requests = await friendsService.listPendingRequests(currentUserId)
        res.success(requests, "成功获取待处理的好友请求。")
    } catch (error: any) {
        logger.error(`获取待处理请求失败: ${error.message}`)
        next(error)
    }
})

// ==============================================================================
// 2. 管理好友关系
// ==============================================================================

/**
 * @route   POST /api/friends/requests
 * @desc    发送一个好友请求
 * @access  Private
 */
router.post("/requests", async (req, res, next) => {
    try {
        const { addresseeEmail } = sendFriendRequestValidate.parse(req.body)
        const requesterId = req.user!.userId

        const result = await friendsService.sendFriendRequest(requesterId, addresseeEmail)
        res.success({ addresseeId: result.addresseeId }, "好友请求已发送。")
    } catch (error: any) {
        logger.error(`发送好友请求失败: ${error.message}`)
        next(error)
    }
})

/**
 * @route   PUT /api/friends/requests/:requesterId
 * @desc    响应一个好友请求 (接受或拒绝)
 * @access  Private
 */
router.put("/requests/:requesterId", async (req, res, next) => {
    try {
        const { requesterId } = req.params
        const { action } = req.body
        const { requesterId: parsedRequesterId, action: parsedAction } = respondToRequestValidate.parse({
            requesterId,
            action
        })

        const currentUserId = req.user!.userId
        const status = parsedAction === "accept" ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.BLOCKED

        await friendsService.respondToFriendRequest(currentUserId, parsedRequesterId, status)

        res.success(
            { requesterId: parsedRequesterId, status },
            `已${parsedAction === "accept" ? "接受" : "拒绝"}好友请求。`
        )
    } catch (error: any) {
        logger.error(`响应好友请求失败: ${error.message}`)
        next(error)
    }
})

/**
 * @route   DELETE /api/friends/:friendId
 * @desc    删除一个好友
 * @access  Private
 */
router.delete("/:friendId", async (req, res, next) => {
    try {
        const { friendId } = deleteFriendValidate.parse(req.params)
        const currentUserId = req.user!.userId

        await friendsService.deleteFriend(currentUserId, friendId)

        res.success({ friendId: friendId }, "好友删除成功。")
    } catch (error: any) {
        logger.error(`删除好友失败: ${error.message}`)
        next(error)
    }
})

export default router
