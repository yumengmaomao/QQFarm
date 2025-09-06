import type { ApiResponse } from "./index.js"
import type { AuthJwtPayload } from "./jwt.d.ts"
// 通过声明合并，为 Express 的 Response 接口添加自定义方法
declare global {
  namespace Express {
    export interface Response {
      /**
       * 发送一个标准的成功响应
       */
      success<T>(data: T, message?: string): this

      /**
       * 发送一个标准的失败响应
       */
      error(httpStatus: number, code: number, message: string, errorDetails?: string): this
    }
    export interface Request {
      user: {
        userId: number
        farmId: number
        email: string
        nickName: string
      }
    }
  }
}

// 添加一个空的 export {} 是为了告诉 TypeScript 这是一个模块文件
export {}
