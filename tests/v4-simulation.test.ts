import { describe, expect, it } from 'vitest'
import { dynamicFee, fixedFee, quoteEth, rangeState, settlementAt } from '@/v4/simulation'

describe('v4 teaching labs', () => {
  it('quotes greater average cost and price impact for larger buys from the same reserves', () => {
    const small = quoteEth(100)
    const large = quoteEth(2000)

    expect(small.fee).toBe(0.3)
    expect(large.fee).toBe(6)
    expect(large.eth).toBeGreaterThan(small.eth)
    expect(large.averagePrice).toBeGreaterThan(small.averagePrice)
    expect(large.priceImpact).toBeGreaterThan(small.priceImpact)
    expect(quoteEth(100)).toEqual(small)
  })

  it('treats the lower range boundary as active and the upper boundary as inactive', () => {
    expect(rangeState(1899, 1900, 2100)).toBe('below')
    expect(rangeState(1900, 1900, 2100)).toBe('active')
    expect(rangeState(2099, 1900, 2100)).toBe('active')
    expect(rangeState(2100, 1900, 2100)).toBe('above')
  })

  it('lets the sample dynamic schedule go below or above the fixed LP fee', () => {
    expect(dynamicFee(0)).toBe(500)
    expect(dynamicFee(30)).toBeLessThan(fixedFee)
    expect(dynamicFee(70)).toBeGreaterThan(fixedFee)
    expect(dynamicFee(100)).toBe(8000)
  })

  it('nets the intermediate currency and reverts on an outstanding payment', () => {
    expect(settlementAt(1, false).deltas).toEqual([-100, 0.05, 0])
    expect(settlementAt(2, false).deltas).toEqual([-100, 0, 99])
    expect(settlementAt(3, false)).toEqual({ deltas: [0, 0, 0], status: 'settled' })
    expect(settlementAt(3, true)).toEqual({ deltas: [-100, 0, 0], status: 'reverted' })
  })
})
