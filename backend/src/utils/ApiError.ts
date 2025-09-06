import createErrors from "http-errors"

/**
 * 自定义API错误类
 * 继承自HttpError，增加了业务错误码 businessCode 字段
 */
export class ApiError extends Error {
    public readonly businessCode: number
    public readonly status: number

    /**
     * @param httpStatus - HTTP状态码 (e.g., 400, 403, 404)
     * @param businessCode - 来自 AppErrorCodes 的业务错误码
     * @param message - 人类可读的错误信息
     */
    constructor(httpStatus: number, businessCode: number, message: string) {
        // 核心修正：调用基类构造函数只传递 message
        super(message)

        // 将 httpStatus 赋值给实例的 status 属性
        this.status = httpStatus

        this.name = "ApiError"
        this.businessCode = businessCode
    }
}
