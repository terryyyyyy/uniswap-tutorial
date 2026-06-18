import { describe, it, expect } from 'vitest'
import { getSqrtRatioAtTick, getTickAtSqrtRatio, priceToTick, tickToPrice } from '@/simulations/tickMath'
import { MIN_TICK, MAX_TICK, MIN_SQRT_RATIO, MAX_SQRT_RATIO, Q96 } from '@/constants/uniswap'

describe('TickMath', () => {
  it('tick=0 → 2^96', () => { expect(getSqrtRatioAtTick(0)).toBe(Q96) })
  it('MIN/MAX 边界精确', () => {
    expect(getSqrtRatioAtTick(MIN_TICK)).toBe(MIN_SQRT_RATIO)
    expect(getSqrtRatioAtTick(MAX_TICK)).toBe(MAX_SQRT_RATIO)
  })
  it('getTickAtSqrtRatio 反查 tick=0', () => { expect(getTickAtSqrtRatio(Q96)).toBe(0) })
  it('MIN_SQRT_RATIO → MIN_TICK', () => { expect(getTickAtSqrtRatio(MIN_SQRT_RATIO)).toBe(MIN_TICK) })
  it('近 MAX 边界（tick=800000，远离 MAX_TICK）', () => {
    const s = getSqrtRatioAtTick(800000)
    const back = getTickAtSqrtRatio(s)
    expect(Math.abs(back - 800000)).toBeLessThanOrEqual(2)
  })
  it('往返一致（容差 1 tick，tick 范围 ±10000）', () => {
    for (const tick of [-10000, -1000, -100, 0, 100, 1000, 10000]) {
      const sqrt = getSqrtRatioAtTick(tick)
      expect(Math.abs(getTickAtSqrtRatio(sqrt) - tick)).toBeLessThanOrEqual(1)
    }
  })
  it('priceToTick/tickToPrice', () => {
    expect(tickToPrice(0)).toBeCloseTo(1, 6)
    expect(Math.abs(priceToTick(1) - 0)).toBeLessThanOrEqual(1)
  })
})
