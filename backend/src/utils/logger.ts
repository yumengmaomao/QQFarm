import winston from "winston"

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white"
}
winston.addColors(colors)

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const service = info.service ? ` [${info.service}]` : ""
    return `${info.timestamp} ${info.level}:${service} ${info.message}`
  })
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error"
  }),
  new winston.transports.File({ filename: "logs/combined.log" })
]

const baseLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "http" : "debug",
  levels,
  format: logFormat,
  transports
})

// [新增] 创建一个专门用于记录 HTTP 请求的子记录器
const httpLogger = baseLogger.child({ service: "Http" })

baseLogger.stream = {
  // @ts-ignore
  write: (message: string) => {
    // [修改] 使用 httpLogger 来记录，这样日志就会自动带上 [Http] 标签
    httpLogger.http(message.substring(0, message.lastIndexOf("\n")))
  }
}

/**
 * 获取一个带有服务名称作用域的日志记录器
 * @param serviceName - 服务名称
 */
export const getLogger = (serviceName: string) => {
  return baseLogger.child({ service: serviceName })
}

export default baseLogger
