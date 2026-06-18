import { describe, it, expect } from 'vitest'
import { PoolSimulator } from '@/simulations/pool'
import { Q96 } from '@/constants/uniswap'

describe('PoolSimulator', () => {
  it('initialize + mint + swap 端到端', () => {
    const pool = new PoolSimulator('WETH', 'USDC', 3000)
    pool.initialize(Q96)
    pool.mint('alice', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
    expect(pool.s.liquidity).toBeGreaterThan(0n)
    const r = pool.swap(10n * 10n ** 18n, true)
    expect(r.amountOut).toBeGreaterThan(0n)
    expect(r.amountIn).toBeGreaterThan(0n)
    expect(pool.s.sqrtPriceX96).toBeLessThan(Q96) // token0 进 → 价格下降
    expect(r.priceImpactBps).toBeGreaterThan(0)   // impact 非 0
  })
  it('swap !zeroForOne 价格上升', () => {
    const pool = new PoolSimulator('A', 'B', 3000)
    pool.initialize(Q96)
    pool.mint('lp', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
    const r = pool.swap(10n * 10n ** 18n, false)
    expect(r.amountOut).toBeGreaterThan(0n)
    expect(pool.s.sqrtPriceX96).toBeGreaterThan(Q96)
  })
  it('大额 swap 跨 tick', () => {
    const pool = new PoolSimulator('A', 'B', 100) // tickSpacing=1，易跨 tick
    pool.initialize(Q96)
    pool.mint('lp', -10, 10, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
    const r = pool.swap(500_000n * 10n ** 18n, true)
    expect(r.amountOut).toBeGreaterThan(0n)
    // 大额应使价格大幅移动
    expect(pool.s.sqrtPriceX96).toBeLessThan(Q96)
  })
  it('snapshot() 深拷贝且保留 bigint（与 pool.s 独立）', () => {
    const pool = new PoolSimulator('A', 'B', 3000)
    pool.initialize(Q96)
    pool.mint('lp', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
    const snap = pool.snapshot()
    // bigint 字段保留且等值
    expect(typeof snap.liquidity).toBe('bigint')
    expect(snap.liquidity).toBe(pool.s.liquidity)
    expect(typeof snap.sqrtPriceX96).toBe('bigint')
    expect(snap.sqrtPriceX96).toBe(Q96)
    // tick 子结构 bigint 保留
    const tl = snap.ticks[-600]
    expect(typeof tl.liquidityGross).toBe('bigint')
    expect(tl.liquidityGross).toBe(pool.s.ticks[-600].liquidityGross)
    // 深拷贝独立：改快照不影响原状态
    snap.liquidity = 0n
    expect(pool.s.liquidity).toBeGreaterThan(0n)
  })
})
