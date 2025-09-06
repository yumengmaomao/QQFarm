/**
 * 应用业务逻辑错误码枚举
 * 规范：
 * - 1xxx: 通用和认证错误
 * - 2xxx: 自身农场和地块操作错误
 * - 3xxx: 好友关系和社交互动错误
 */
export const AppErrorCodes = {
  // --- 1xxx: 通用和认证 ---
  VALIDATION_ERROR: 1000, // Zod验证失败
  UNAUTHORIZED: 1001, // 未认证或Token无效
  INVALID_CREDENTIALS: 1101, // 用户名或密码错误
  EMAIL_ALREADY_EXISTS: 1102, // 邮箱已注册
  INVALID_REFRESH_TOKEN: 1103, // Refresh Token 无效或已过期

  // --- 2xxx: 农场与地块 ---
  PLOT_NOT_FOUND: 2001, // 地块不存在
  PLOT_NOT_EMPTY: 2002, // 地块已被种植
  PLOT_IS_EMPTY: 2003, // 空地块无法执行操作（如施肥、收获）
  CROP_NOT_MATURED: 2004, // 作物未成熟
  LEVEL_REQUIREMENT_NOT_MET: 2005, // 等级不足
  INSUFFICIENT_SEEDS: 2006, // 种子数量不足
  NOTHING_TO_HARVEST: 2007, // (批量) 没有可收获的作物
  NOTHING_TO_WATER: 2008, // (批量) 没有需要浇水的地块
  NO_WEEDS_TO_REMOVE: 2009, // 没有杂草需要清除
  NO_PESTS_TO_REMOVE: 2010, // 没有害虫需要清除

  // --- 3xxx: 好友与社交 ---
  NOT_FRIENDS: 3001, // 你们不是好友关系
  CANNOT_INTERACT_WITH_SELF: 3002, // 不能与自己互动（偷窃、加好友等）
  FRIEND_NOT_FOUND: 3003, // 找不到指定的用户
  ALREADY_STOLEN: 3004, // 已经偷过这批作物
  CROP_FULLY_STOLEN: 3005, // 作物已被偷光
  DAILY_SABOTAGE_LIMIT_EXCEEDED: 3006, // 每日捣乱次数已达上限
  CANNOT_HELP_SELF_SABOTAGE: 3007, // 不能通过清除自己放的草/虫来获取奖励
  PLOT_ALREADY_HAS_WEED: 3008, // 地块上已有杂草
  PLOT_ALREADY_HAS_PEST: 3009, // 地块上已有害虫

  // --- 9xxx: 服务器内部错误 ---
  INTERNAL_SERVER_ERROR: 9999
} as const
