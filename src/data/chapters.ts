import type { Chapter } from '@/types'
import { lessons } from './lessons'

// 8 章元数据（lessons 在 Chunk 8 填充后自动按 chapterId 归类）
export const chapters: Chapter[] = [
  { id: 1, title: 'AMM 基础', description: '从订单簿到自动做市商，理解恒定乘积公式', icon: '📊', lessons: [] },
  { id: 2, title: '集中流动性', description: 'V3 的核心创新：价格区间与资本效率', icon: '🎯', lessons: [] },
  { id: 3, title: 'Tick 机制', description: '价格的离散化表示与 tick 状态管理', icon: '📏', lessons: [] },
  { id: 4, title: '仓位管理', description: 'Position 的添加、移除与 NFT 化', icon: '💼', lessons: [] },
  { id: 5, title: 'Swap 执行', description: '单 tick 与跨 tick 的 swap 计算流程', icon: '🔄', lessons: [] },
  { id: 6, title: '手续费计算', description: 'feeGrowth 累计机制与 LP 收益分配', icon: '💰', lessons: [] },
  { id: 7, title: '核心合约源码', description: 'Factory、Pool、PoolDeployer 逐行解析', icon: '🔬', lessons: [] },
  { id: 8, title: '外围合约', description: 'SwapRouter、NPM、Quoter 实战', icon: '🏛️', lessons: [] },
]

// 按 chapterId 归类 lessons 到对应章节
for (const ch of chapters) {
  ch.lessons = lessons
    .filter((l) => l.chapterId === ch.id)
    .sort((a, b) => a.order - b.order)
}
