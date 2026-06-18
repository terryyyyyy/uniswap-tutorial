import type { UserProgress } from '@/types'
import { chapters } from './chapters'

export interface Badge {
  id: string
  name: string
  icon: string
  desc: string
  condition: (p: UserProgress) => boolean
}

// 判断某章所有关卡是否已完成
function chapterDone(p: UserProgress, chapterId: number): boolean {
  const ch = chapters.find((c) => c.id === chapterId)
  return !!ch && ch.lessons.every((l) => p.completedLessons.includes(l.id))
}

// 10 个徽章（对齐 spec）
export const BADGES: Badge[] = [
  { id: 'amm-starter', name: 'AMM 入门', icon: '📊', desc: '完成第 1 章', condition: (p) => chapterDone(p, 1) },
  { id: 'cl-explorer', name: '集中流动性探索者', icon: '🎯', desc: '完成第 2 章', condition: (p) => chapterDone(p, 2) },
  { id: 'tick-master', name: 'Tick 计算达人', icon: '📏', desc: '完成第 3 章', condition: (p) => chapterDone(p, 3) },
  { id: 'position-master', name: '仓位管理大师', icon: '💼', desc: '完成第 4 章', condition: (p) => chapterDone(p, 4) },
  { id: 'swap-executor', name: 'Swap 执行者', icon: '🔄', desc: '完成第 5 章', condition: (p) => chapterDone(p, 5) },
  { id: 'fee-expert', name: '手续费专家', icon: '💰', desc: '完成第 6 章', condition: (p) => chapterDone(p, 6) },
  { id: 'source-reader', name: '源码解析师', icon: '🔬', desc: '完成第 7 章', condition: (p) => chapterDone(p, 7) },
  { id: 'v3-architect', name: 'V3 架构师', icon: '🏛️', desc: '完成第 8 章', condition: (p) => chapterDone(p, 8) },
  {
    id: 'grad',
    name: '全栈毕业',
    icon: '🎓',
    desc: '所有关卡 3 星',
    condition: (p) => Object.values(p.stars).length >= 35 && Object.values(p.stars).every((s) => s === 3),
  },
  {
    id: 'flash',
    name: '闪电学习者',
    icon: '⚡',
    desc: '5 关获得 3 星',
    condition: (p) => Object.values(p.stars).filter((s) => s === 3).length >= 5,
  },
]
