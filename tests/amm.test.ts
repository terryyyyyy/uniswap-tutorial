import { describe, it, expect } from 'vitest'
import { AMMSimulator } from '@/simulations/amm'

describe('AMM V2', () => {
  it('x*y=k 守恒（扣费后净额）', () => {
    const amm = new AMMSimulator(1_000_000n, 1_000_000n)
    amm.swap(10_000n, true, 0)
    // fee=0 时 amountInNet=amountIn 全进。V2 整数实现 amountOut 向下取整，
    // 故 k 只增不减（守恒下界）：k_new = (Rx+in)*(Ry-floor(out)) >= Rx*Ry，
    // 超出量来自取整余量（< 1 单位 token1 * 新 reserveX）。
    const kBefore = 1_000_000n * 1_000_000n
    const kAfter = amm.reserveX * amm.reserveY
    expect(kAfter).toBeGreaterThanOrEqual(kBefore)
    expect(kAfter - kBefore).toBeLessThan(amm.reserveX) // 仅取整余量
  })
  it('小额度滑点小', () => {
    const amm = new AMMSimulator(1_000_000n, 1_000_000n)
    const r = amm.swap(100n, true, 0)
    expect(r.priceImpactBps).toBeLessThan(50)
  })
  it('大额度滑点大', () => {
    const amm = new AMMSimulator(1_000_000n, 1_000_000n)
    const r = amm.swap(500_000n, true, 0)
    expect(r.priceImpactBps).toBeGreaterThan(2000)
  })
})
