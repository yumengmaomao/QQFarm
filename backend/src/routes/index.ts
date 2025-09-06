import express, { Router } from "express"

// 导入所有路由模块
import loginRouter from "./login.js"
import farmRouter from "./farm.js"
import friendsRouter from "./friends.js"
import friendFarmRouter from "./friendFarm.js"
import shopRouter from "./shop.js"
import leaderboardRouter from "./leaderboard.js" // 【新增】导入排行榜路由

const mainRouter: Router = express.Router()

// 将所有路由模块挂载到主路由上
// Express 会根据请求的 URL 前缀，将请求分发给对应的路由模块处理

// 1. 认证相关路由，例如 /api/auth/login
mainRouter.use("/auth", loginRouter)

// 3. 用户自己的农场操作路由，例如 /api/farm/plots/1/water
mainRouter.use("/farm", farmRouter)

// 4. 好友关系管理路由，例如 /api/friends
mainRouter.use("/friends", friendsRouter)

// 5. 好友农场互动路由，例如 /api/friends/123/farm/plots/1/steal
mainRouter.use("/friends", friendFarmRouter) // 注意：这个也挂载在 /friends 下

// 6. 商店相关路由, 例如 /api/shop/listings
mainRouter.use("/shop", shopRouter)

// 7. 【新增】排行榜相关路由, 例如 /api/leaderboard?type=wealth
mainRouter.use("/leaderboard", leaderboardRouter)

mainRouter.get("/", () => {
    console.log("llll")
})
export default mainRouter
