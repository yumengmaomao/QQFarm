export type UserJwtPayload = {
  email: string
}
export interface AuthJwtPayload extends UserJwtPayload, Pick<Required<OriginalJwtPayload>, "sub"> {
  // 这里我们明确重写 sub 字段，确保它是一个必需的 string
  sub: string
}

declare module "jsonwebtoken" {
  export interface JwtPayload extends UserJwtPayload {}
}
