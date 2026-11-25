import { Connection, Grid, Histogram, Odometer, Switch, Tickets } from '@element-plus/icons-vue'
import type { LessonId } from './course'

export const courseIcons = {
  swap: Switch,
  liquidity: Histogram,
  'pool-manager': Grid,
  hooks: Connection,
  fees: Odometer,
  settlement: Tickets,
} satisfies Record<LessonId, unknown>
