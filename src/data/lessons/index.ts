import type { Lesson } from '@/types'

// 35 关课程聚合导出。Chunk 8 逐章 import 并 push。
import { lesson as ch1_1 } from './ch1-1'
import { lesson as ch1_2 } from './ch1-2'
import { lesson as ch1_3 } from './ch1-3'
import { lesson as ch1_4 } from './ch1-4'
import { lesson as ch2_1 } from './ch2-1'
import { lesson as ch2_2 } from './ch2-2'
import { lesson as ch2_3 } from './ch2-3'
import { lesson as ch2_4 } from './ch2-4'
import { lesson as ch3_1 } from './ch3-1'
import { lesson as ch3_2 } from './ch3-2'
import { lesson as ch3_3 } from './ch3-3'
import { lesson as ch3_4 } from './ch3-4'
import { lesson as ch3_5 } from './ch3-5'
import { lesson as ch4_1 } from './ch4-1'
import { lesson as ch4_2 } from './ch4-2'
import { lesson as ch4_3 } from './ch4-3'
import { lesson as ch4_4 } from './ch4-4'

export const lessons: Lesson[] = [
  ch1_1, ch1_2, ch1_3, ch1_4,
  ch2_1, ch2_2, ch2_3, ch2_4,
  ch3_1, ch3_2, ch3_3, ch3_4, ch3_5,
  ch4_1, ch4_2, ch4_3, ch4_4,
]
