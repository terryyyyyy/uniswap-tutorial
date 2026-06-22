import type { Lesson } from '@/types'

// 35 关课程聚合导出。Chunk 8 逐章 import 并 push。
import { lesson as ch1_1 } from './ch1-1'
import { lesson as ch1_2 } from './ch1-2'
import { lesson as ch1_3 } from './ch1-3'
import { lesson as ch1_4 } from './ch1-4'

export const lessons: Lesson[] = [
  ch1_1, ch1_2, ch1_3, ch1_4,
]
