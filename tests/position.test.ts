import { describe, it, expect } from 'vitest'
import { getLiquidityForAmounts, getAmountsForLiquiditySqrt } from '@/simulations/position'
import { Q96 } from '@/constants/uniswap'

describe('Position/LiquidityAmounts', () => {
  it('区间内 amount0/1 都>0', () => {
    const sqrtA = Q96 * 9n / 10n, sqrtB = Q96 * 11n / 10n
    const L = 1_000_000n * 10n ** 18n
    const r = getAmountsForLiquiditySqrt(Q96, sqrtA, sqrtB, L)
    expect(r.amount0).toBeGreaterThan(0n); expect(r.amount1).toBeGreaterThan(0n)
  })
  it('L↔amount 往返（.sol 由于 floor 截断最多差 1 单位流动性）', () => {
    const sqrtA = Q96 * 9n / 10n, sqrtB = Q96 * 11n / 10n
    const L = 1_000_000n * 10n ** 18n
    const { amount0, amount1 } = getAmountsForLiquiditySqrt(Q96, sqrtA, sqrtB, L)
    const back = getLiquidityForAmounts(Q96, sqrtA, sqrtB, amount0, amount1)
    // Uniswap LiquidityAmounts.sol 的 getAmountsForLiquidity 与 getLiquidityForAmounts
    // 并非精确互逆（mulDiv 两次 floor），往返最多丢失 1 单位流动性。对照 .sol 行为断言。
    expect(back).toBeGreaterThanOrEqual(L - 1n)
    expect(back).toBeLessThanOrEqual(L)
  })
})
