import { describe, it, expect } from 'vitest'
import { mulDiv, mulDivRoundingUp } from '@/simulations/fullMath'

describe('FullMath', () => {
  it('mulDiv 基本乘除', () => {
    expect(mulDiv(3n, 4n, 2n)).toBe(6n)
    expect(mulDiv(2n ** 160n, 2n ** 160n, 2n ** 160n)).toBe(2n ** 160n)
  })
  it('mulDiv 向下取整', () => {
    expect(mulDiv(5n, 3n, 2n)).toBe(7n)
  })
  it('mulDivRoundingUp 向上取整', () => {
    expect(mulDivRoundingUp(5n, 3n, 2n)).toBe(8n)
    expect(mulDivRoundingUp(4n, 2n, 2n)).toBe(4n)
  })
})
