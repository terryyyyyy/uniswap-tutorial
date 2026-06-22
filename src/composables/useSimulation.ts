import { formatBigInt, formatSqrtPriceX96 } from '@/utils/format'
import type { PoolSnapshot } from '@/types/simulation'

export function useSimulation() {
  return {
    liquidityBars: (snap: PoolSnapshot) =>
      Object.entries(snap.ticks)
        .filter(([, t]) => t.liquidityGross > 0n)
        .map(([tick, t]) => [Number(tick), formatBigInt(t.liquidityGross, 18)] as [number, number]),
    priceOf: (sqrtX96: bigint) => formatSqrtPriceX96(sqrtX96),
  }
}
