import type { Request, Response, NextFunction } from "express"
import { HttpError } from "http-errors"
import { ZodError } from "zod"
import { ApiError } from "./ApiError.js"
import { AppErrorCodes } from "./errorCodes.js"
import { getLogger } from "./logger.js"
const logger = getLogger("ErrorHandler")
import {} from "express"
export default function handlerHttpError(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof ApiError) {
        logger.warn(`ApiError: ${error.message} (HTTP ${error.status}, Code ${error.businessCode})`)
        res.error(error.status, error.businessCode, error.message)
    } else if (error instanceof ZodError) {
        // 【修复】使用 `error.issues` 代替 `error.errors`，并为 map 参数添加类型
        const validationErrors = error.issues.map((e: any) => e.message).join(", ")
        logger.warn(`Validation Error: ${validationErrors}`)
        res.error(400, AppErrorCodes.VALIDATION_ERROR, validationErrors)
    } else if (error instanceof HttpError) {
        logger.warn(`HttpError: ${error.message} (HTTP ${error.status})`)
        res.error(error.status, 1, error.message)
    } else if (error instanceof SyntaxError && "body" in error) {
        logger.warn(`SyntaxError: 来自${req.path} 的json是非法的`)
        res.status(400).send("非法的json")
    } else {
        logger.error(`Internal Server Error: ${error.message}`, { stack: error.stack })
        console.log("error :>> ", error)
        const errorMessage = process.env.NODE_ENV === "production" ? "服务器开小差了，请稍后再试。" : error.message
        res.error(500, AppErrorCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", errorMessage)
    }
}
