import { describe, it, expect } from 'vitest'
import { growFeeGlobal, positionFeeOwed, distributeFee } from '@/simulations/fee'

describe('Fee', () => {
  it('growFeeGlobal 单调递增', () => {
    const a = growFeeGlobal(0n, 1000n, 1_000_000n)
    expect(a).toBeGreaterThan(0n)
    const b = growFeeGlobal(a, 1000n, 1_000_000n)
    expect(b).toBeGreaterThan(a)
  })
  it('distributeFee 按比例', () => {
    const r = distributeFee(1000n, [{ liquidity: 3n }, { liquidity: 1n }])
    expect(r[0]).toBe(750n); expect(r[1]).toBe(250n)
  })
})
