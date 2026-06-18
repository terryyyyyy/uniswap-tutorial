import { describe, it, expect } from 'vitest'
import { computeSwapStep } from '@/simulations/swapMath'
import { Q96 } from '@/constants/uniswap'

describe('SwapMath.computeSwapStep', () => {
  // L 取 Q96 量级，使 1000 wei 的 sqrt 价格变动能产生 >0 的 token 数量；
  // 若用 1e24，则 amountOut = L*Δsqrt/Q96 = 1e24*1000/2^96 ≈ 0.0126 → 向下取整为 0，
  // 断言 amountOut>0 在数学上不可成立。此为测试输入量级修正，未放松任何断言。
  const L = Q96
  it('exactIn zeroForOne 到达目标价', () => {
    const r = computeSwapStep(Q96, Q96 - 1000n, L, 1_000n * 10n ** 18n, 3000)
    expect(r.sqrtPriceNextX96).toBeLessThanOrEqual(Q96)
    expect(r.amountIn).toBeGreaterThan(0n)
    expect(r.amountOut).toBeGreaterThan(0n)
    expect(r.feeAmount).toBeGreaterThan(0n)
  })
  it('exactIn !zeroForOne 到达目标价', () => {
    const r = computeSwapStep(Q96, Q96 + 1000n, L, 1_000n * 10n ** 18n, 3000)
    expect(r.sqrtPriceNextX96).toBeGreaterThanOrEqual(Q96)
    expect(r.amountIn).toBeGreaterThan(0n)
    expect(r.amountOut).toBeGreaterThan(0n)
  })
  it('未达目标时 feeAmount >= 0', () => {
    const r = computeSwapStep(Q96, Q96 - 1000n, L, 1n, 3000)
    expect(r.feeAmount).toBeGreaterThanOrEqual(0n)
  })
})
