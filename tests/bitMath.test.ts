import { describe, it, expect } from 'vitest'
import { mostSignificantBit, leastSignificantBit } from '@/simulations/bitMath'

describe('BitMath', () => {
  it('mostSignificantBit', () => {
    expect(mostSignificantBit(1n)).toBe(0)
    expect(mostSignificantBit(2n)).toBe(1)
    expect(mostSignificantBit(255n)).toBe(7)
    expect(mostSignificantBit(256n)).toBe(8)
    expect(mostSignificantBit(2n ** 255n)).toBe(255)
  })
  it('leastSignificantBit', () => {
    expect(leastSignificantBit(1n)).toBe(0)
    expect(leastSignificantBit(8n)).toBe(3)
    expect(leastSignificantBit(0b10100n)).toBe(2)
  })
})
