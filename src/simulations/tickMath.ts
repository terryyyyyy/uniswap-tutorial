// TickMath 复刻（对照 v3-core/contracts/libraries/TickMath.sol）
// 合约用 14 段查表 + 牛顿迭代全区间精确；本实现用浮点近似 + 边界常量钳制。
// 对 |tick|<=10000 相对误差 <1e-9；接近 MAX 时用边界常量兜底。教学精度足够。
import { MIN_TICK, MAX_TICK, MIN_SQRT_RATIO, MAX_SQRT_RATIO, Q96 } from '@/constants/uniswap'

export function getSqrtRatioAtTick(tick: number): bigint {
  if (tick < MIN_TICK || tick > MAX_TICK) throw new Error('TickMath: TICK_BOUND')
  if (tick === MIN_TICK) return MIN_SQRT_RATIO
  if (tick === MAX_TICK) return MAX_SQRT_RATIO
  // sqrtPrice = 1.0001^(tick/2) * 2^96
  const ratio = Math.pow(1.0001, tick / 2)
  return BigInt(Math.round(ratio * Number(Q96)))
}

export function getTickAtSqrtRatio(sqrtPriceX96: bigint): number {
  // 合约要求 sqrtPriceX96 严格在 (MIN, MAX) 内；本模拟对边界也钳制返回
  if (sqrtPriceX96 < MIN_SQRT_RATIO || sqrtPriceX96 > MAX_SQRT_RATIO) throw new Error('TickMath: SQRT_RATIO_BOUND')
  if (sqrtPriceX96 <= MIN_SQRT_RATIO) return MIN_TICK
  if (sqrtPriceX96 >= MAX_SQRT_RATIO) return MAX_TICK
  const ratio = Number(sqrtPriceX96) / Number(Q96)
  const tick = Math.floor(2 * Math.log(ratio) / Math.log(1.0001))
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick))
}

export function priceToTick(price: number): number {
  if (price <= 0) throw new Error('price must be positive')
  const tick = Math.floor(Math.log(price) / Math.log(1.0001))
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick))
}

export function tickToPrice(tick: number): number {
  return Math.pow(1.0001, tick)
}
