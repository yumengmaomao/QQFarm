// prisma/seed.ts

import { PrismaClient, PropType } from "@prisma/client"
import fs from "fs/promises"
import path from "path"

const prisma = new PrismaClient()

// 定义从JSON文件中读取的数据项的类型结构
type PlantData = {
    id: number
    name: string
    itemType: string
    image: string | null
    requiredLevel: number
    category: string | null
    economics: object
    growth: object
    rewards: object
    efficiency: object
    limits: object
}

// 【新增】定义道具数据的类型结构
type PropData = {
    name: string
    description: string
    propType: PropType
    buyPrice: bigint | null
    sellPrice: bigint
    effect: object | null // 【核心改动】添加 effect 字段
    image?: string
}

async function main() {
    try {
        // ==============================================================================
        // 1. 填充植物数据 (保留原有逻辑)
        // ==============================================================================
        console.log("🌱 开始填充植物数据...")

        const jsonFileName = "farm_plant_data_final.json"
        const filePath = path.join(process.cwd(), jsonFileName) // 修正了文件路径，使其在项目根目录运行时也能找到

        console.log(`正在从 ${filePath} 读取数据...`)

        const fileContent = await fs.readFile(filePath, "utf-8")
        const plantData: PlantData[] = JSON.parse(fileContent)

        console.log(`读取成功！共找到 ${plantData.length} 条植物数据。`)
        console.log("正在清空旧的植物数据...")

        await prisma.plant.deleteMany({})

        console.log("开始将植物数据写入数据库...")
        for (const plant of plantData) {
            await prisma.plant.create({
                data: {
                    id: plant.id,
                    name: plant.name,
                    itemType: plant.itemType,
                    image: `https://zlpt-data.oss-cn-shenzhen.aliyuncs.com/image/znpt/qhome/yangguangmuchang/images/seed/${plant.id}.png`,
                    requiredLevel: plant.requiredLevel,
                    category: plant.category,
                    economics: plant.economics,
                    growth: plant.growth,
                    rewards: plant.rewards,
                    efficiency: plant.efficiency,
                    limits: plant.limits
                }
            })
            process.stdout.write(` ✓ 已插入植物: ${plant.name}\r`)
        }
        console.log("\n✅ 植物数据填充成功！")

        // ==============================================================================
        // 2. 【新增】填充道具数据
        // ==============================================================================
        console.log("\n🔨 开始填充道具数据...")

        const propsToSeed: PropData[] = [
            {
                name: "普通化肥",
                description: "基础肥料，可以缩短作物15分钟的生长时间。",
                propType: PropType.FERTILIZER,
                buyPrice: 50n,
                sellPrice: 10n,
                effect: { type: "timeReduction", value: 900, unit: "seconds" }
            },
            {
                name: "高速化肥",
                description: "高效肥料，可以缩短作物1小时的生长时间。",
                propType: PropType.FERTILIZER,
                buyPrice: 200n,
                sellPrice: 50n,
                effect: { type: "timeReduction", value: 3600, unit: "seconds" }
            },
            {
                name: "稻草人",
                description: "一个经典的稻草人，可以装饰你的农场。",
                propType: PropType.DECORATION,
                buyPrice: 500n,
                sellPrice: 100n,
                effect: { type: "placement", area: "farm" }
            },
            {
                name: "风车",
                description: "一个漂亮的荷兰风车，让你的农场更有格调。",
                propType: PropType.DECORATION,
                buyPrice: 2000n,
                sellPrice: 400n,
                effect: { type: "placement", area: "farm" }
            },
            {
                name: "双倍经验卡 (1小时)",
                description: "使用后一小时内，所有操作获得的经验值翻倍。",
                propType: PropType.CONSUMABLE,
                buyPrice: 1000n,
                sellPrice: 250n,
                effect: { type: "statusBuff", buff: "doubleExp", duration: 3600, unit: "seconds" }
            },
            {
                name: "土地升级卷",
                description: "用于将普通土地升级为更高等级的土地。",
                propType: PropType.SPECIAL,
                buyPrice: 5000n, // <-- 已修复此处的语法错误
                sellPrice: 1000n,
                effect: { type: "unlock", target: "landPlot" }
            }
        ]

        console.log("正在清空旧的道具数据...")
        await prisma.prop.deleteMany({})

        console.log("开始将道具数据写入数据库...")
        for (const prop of propsToSeed) {
            await prisma.prop.create({
                data: {
                    name: prop.name,
                    description: prop.description,
                    propType: prop.propType,
                    buyPrice: prop.buyPrice,
                    sellPrice: prop.sellPrice,
                    effect: JSON.stringify(prop.effect), // 插入 effect 数据
                    image: prop.image ?? null
                }
            })
            process.stdout.write(` ✓ 已插入道具: ${prop.name}\r`)
        }

        console.log("\n✅ 道具数据填充成功！")
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.error(
                `❌ 文件未找到！请确保名为 "${path.basename(
                    error.path
                )}" 的数据文件存在于你的项目根目录的 src 文件夹中。`
            )
        } else {
            console.error("❌ 数据填充过程中发生错误:", error)
        }
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// 执行主函数
main()
