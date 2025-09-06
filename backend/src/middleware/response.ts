import type { Request, Response, NextFunction } from "express"
import type { ApiResponse } from "../types/index.js"
import { convertBigIntToString } from "../utils/helpers.js"
export function responseEnhancer(req: Request, res: Response, next: NextFunction) {
    res.success = function <T>(data: T, message: string = "Success"): Response {
        const response: ApiResponse<T> = {
            code: 0,
            message,
            data: convertBigIntToString(data)
        }
        return this.status(200).json(response)
    }

    res.error = function (httpStatus: number, code: number, message: string, errorDetails?: string): Response {
        const response: ApiResponse<never> = {
            code,
            message
        }
        if (errorDetails) {
            response.error = errorDetails
        }
        return this.status(httpStatus).json(response)
    }

    next()
}
