import { describe, it, expect } from 'vitest'
import { FactorySimulator } from '@/simulations/factory'
import { Q96 } from '@/constants/uniswap'

describe('FactorySimulator', () => {
  it('createPool 排序 token0<token1 并可按任意顺序取回', () => {
    const f = new FactorySimulator()
    // 传入顺序相反也应排序存储
    const pool = f.createPool('USDC', 'WETH', 3000)
    expect(pool.token0).toBe('USDC')
    expect(pool.token1).toBe('WETH')
    expect(pool.fee).toBe(3000)
    // 两种顺序都能取到同一个池
    expect(f.getPool('WETH', 'USDC', 3000)).toBe(pool)
    expect(f.getPool('USDC', 'WETH', 3000)).toBe(pool)
  })
  it('同 key 重复创建抛 POOL_EXISTS', () => {
    const f = new FactorySimulator()
    f.createPool('A', 'B', 500)
    expect(() => f.createPool('A', 'B', 500)).toThrow('POOL_EXISTS')
    expect(() => f.createPool('B', 'A', 500)).toThrow('POOL_EXISTS') // 排序后同 key
  })
  it('不同 fee 视为不同池', () => {
    const f = new FactorySimulator()
    const p1 = f.createPool('A', 'B', 3000)
    const p2 = f.createPool('A', 'B', 10000)
    expect(p1).not.toBe(p2)
    expect(f.getPool('A', 'B', 3000)).toBe(p1)
    expect(f.getPool('A', 'B', 10000)).toBe(p2)
  })
  it('工厂创建的池可独立 initialize/mint/swap', () => {
    const f = new FactorySimulator()
    const pool = f.createPool('WETH', 'USDC', 3000)
    pool.initialize(Q96)
    pool.mint('alice', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
    const r = pool.swap(10n * 10n ** 18n, true)
    expect(r.amountOut).toBeGreaterThan(0n)
  })
})
