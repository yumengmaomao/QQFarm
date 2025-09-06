import prisma from "../utils/prisma.js"
import { getLogger } from "../utils/logger.js"
import { ApiError } from "../utils/ApiError.js"
import { AppErrorCodes } from "../utils/errorCodes.js"
import { FriendRequestStatus } from "@prisma/client"

const logger = getLogger("FriendsService")

/**
 * 发送好友请求
 * @param requesterId - 请求发起者的用户ID
 * @param addresseeEmail - 请求接收者的邮箱
 */
async function sendFriendRequest(requesterId: number, addresseeEmail: string) {
    const addressee = await prisma.user.findFirst({
        where: { auth: { email: addresseeEmail } }
    })

    if (!addressee) {
        throw new ApiError(404, AppErrorCodes.FRIEND_NOT_FOUND, `邮箱为 ${addresseeEmail} 的用户不存在。`)
    }

    if (requesterId === addressee.id) {
        throw new ApiError(400, AppErrorCodes.CANNOT_INTERACT_WITH_SELF, "不能添加自己为好友。")
    }

    // 检查是否已存在关系 (双向检查)
    const existingFriendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: requesterId, addresseeId: addressee.id },
                { requesterId: addressee.id, addresseeId: requesterId }
            ]
        }
    })

    if (existingFriendship) {
        if (existingFriendship.status === FriendRequestStatus.ACCEPTED) {
            throw new ApiError(409, 1, "你们已经是好友了。")
        }
        if (existingFriendship.status === FriendRequestStatus.PENDING) {
            throw new ApiError(409, 1, "已发送过好友请求，请等待对方回应。")
        }
        if (existingFriendship.status === FriendRequestStatus.BLOCKED) {
            throw new ApiError(403, 1, "无法向该用户发送好友请求。")
        }
    }

    // 创建新的好友请求记录
    const newRequest = await prisma.friendship.create({
        data: {
            requesterId: requesterId,
            addresseeId: addressee.id,
            status: FriendRequestStatus.PENDING
        }
    })

    logger.info(`用户 ${requesterId} 向用户 ${addressee.id} 发送了好友请求。`)
    return newRequest
}

/**
 * 响应好友请求
 * @param currentUserId - 当前操作的用户ID (即请求的接收者)
 * @param requesterId - 请求的发起者ID
 * @param newStatus - 新的状态 (ACCEPTED 或 BLOCKED)
 */
async function respondToFriendRequest(currentUserId: number, requesterId: number, newStatus: FriendRequestStatus) {
    const request = await prisma.friendship.findUnique({
        where: {
            requesterId_addresseeId: {
                requesterId: requesterId,
                addresseeId: currentUserId
            },
            status: FriendRequestStatus.PENDING // 只处理待处理的请求
        }
    })

    if (!request) {
        throw new ApiError(404, 1, "找不到待处理的好友请求。")
    }

    // 如果接受好友，需要双向创建关系以方便查询
    if (newStatus === FriendRequestStatus.ACCEPTED) {
        return await prisma.$transaction([
            // 更新原始请求的状态
            prisma.friendship.update({
                where: { requesterId_addresseeId: { requesterId, addresseeId: currentUserId } },
                data: { status: newStatus }
            }),
            // 创建一个反向的、同样为 ACCEPTED 的关系
            prisma.friendship.create({
                data: {
                    requesterId: currentUserId,
                    addresseeId: requesterId,
                    status: newStatus
                }
            })
        ])
    } else {
        // 如果拒绝/拉黑，只更新当前请求的状态
        return prisma.friendship.update({
            where: { requesterId_addresseeId: { requesterId, addresseeId: currentUserId } },
            data: { status: newStatus }
        })
    }
}

/**
 * 获取用户的好友列表 (status: ACCEPTED)
 */
async function listFriends(userId: number) {
    const friendships = await prisma.friendship.findMany({
        where: {
            requesterId: userId,
            status: FriendRequestStatus.ACCEPTED
        },
        include: {
            addressee: {
                // 加载好友的公开信息
                select: { id: true, nickName: true, level: true }
            }
        }
    })
    // 只返回好友本身的信息
    return friendships.map((f) => f.addressee)
}

/**
 * 获取用户收到的待处理好友请求
 */
async function listPendingRequests(userId: number) {
    const requests = await prisma.friendship.findMany({
        where: {
            addresseeId: userId,
            status: FriendRequestStatus.PENDING
        },
        include: {
            requester: {
                // 加载请求者的信息
                select: { id: true, nickName: true, level: true }
            }
        }
    })
    return requests
}

/**
 * 删除好友
 * @param currentUserId
 * @param friendId
 */
async function deleteFriend(currentUserId: number, friendId: number) {
    // 删除好友是双向的，需要删除两条记录
    return prisma.friendship.deleteMany({
        where: {
            OR: [
                { requesterId: currentUserId, addresseeId: friendId },
                { requesterId: friendId, addresseeId: currentUserId }
            ],
            status: FriendRequestStatus.ACCEPTED
        }
    })
}

const friendsService = {
    sendFriendRequest,
    respondToFriendRequest,
    listFriends,
    listPendingRequests,
    deleteFriend
}

export default friendsService
