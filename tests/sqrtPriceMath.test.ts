import { describe, it, expect } from 'vitest'
import { getAmount0Delta, getAmount1Delta, getNextSqrtPriceFromAmount0RoundingUp, getNextSqrtPriceFromAmount1RoundingDown } from '@/simulations/sqrtPriceMath'
import { Q96 } from '@/constants/uniswap'

describe('SqrtPriceMath', () => {
  it('getAmount1Delta = L * Δ / Q96', () => {
    const L = 1_000_000n; const sqrtA = Q96; const sqrtB = Q96 + 1n
    expect(getAmount1Delta(sqrtA, sqrtB, L, false)).toBe((L * 1n) / Q96)
  })
  it('getAmount0Delta = (L<<96) * Δ / sqrtB / sqrtA', () => {
    const L = 1_000_000n; const sqrtA = Q96; const sqrtB = Q96 + 1n
    const expected = ((L << 96n) * 1n) / sqrtB / sqrtA
    expect(getAmount0Delta(sqrtA, sqrtB, L, false)).toBe(expected)
  })
  it('amount1 输入 → sqrtPrice 上升', () => {
    const next = getNextSqrtPriceFromAmount1RoundingDown(Q96, 1_000_000n, 1000n, true)
    expect(next).toBeGreaterThan(Q96)
  })
  it('amount0 输入 → sqrtPrice 下降', () => {
    const next = getNextSqrtPriceFromAmount0RoundingUp(Q96, 1_000_000n, 1000n, true)
    expect(next).toBeLessThan(Q96)
  })
})
