// Pool 状态机（对照 v3-core/contracts/UniswapV3Pool.sol）
// 修正点：(1) swap 跨 tick 时 cross 目标 tick，tickCurrent = target-1(zeroForOne)/target
//         (2) priceImpactBps 在循环前捕获 sqrtPriceStart
import type { PoolSnapshot, V3SwapResult } from '@/types/simulation'
import { computeSwapStep } from './swapMath'
import { getSqrtRatioAtTick, getTickAtSqrtRatio } from './tickMath'
import { newTickInfo, update as tickUpdate, cross as tickCross, getFeeGrowthInside, type TickInfo } from './tick'
import { newPosition, update as posUpdate, getLiquidityForAmounts, getAmountsForLiquidity, type PositionState } from './position'
import { growFeeGlobal } from './fee'
import { FEE_TIERS } from '@/constants/uniswap'
import { formatSqrtPriceX96 } from '@/utils/format'

export class PoolSimulator {
  s: PoolSnapshot
  fee: number
  tickSpacing: number
  token0: string
  token1: string

  constructor(token0: string, token1: string, fee: number) {
    this.token0 = token0
    this.token1 = token1
    this.fee = fee
    this.tickSpacing = FEE_TIERS.find((t) => t.fee === fee)!.tickSpacing
    this.s = {
      sqrtPriceX96: 0n, tick: 0, liquidity: 0n,
      feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n,
      ticks: {}, positions: {},
    }
  }

  initialize(sqrtPriceX96: bigint) {
    this.s.sqrtPriceX96 = sqrtPriceX96
    this.s.tick = getTickAtSqrtRatio(sqrtPriceX96)
  }

  mint(owner: string, tickLower: number, tickUpper: number, amount0Desired: bigint, amount1Desired: bigint) {
    const sqrtA = getSqrtRatioAtTick(tickLower)
    const sqrtB = getSqrtRatioAtTick(tickUpper)
    const liquidity = getLiquidityForAmounts(this.s.sqrtPriceX96, sqrtA, sqrtB, amount0Desired, amount1Desired)
    const tl: TickInfo = this.s.ticks[tickLower] ?? newTickInfo()
    const tu: TickInfo = this.s.ticks[tickUpper] ?? newTickInfo()
    tickUpdate(tl, liquidity, this.s.tick, tickLower, this.s.feeGrowthGlobal0X128, this.s.feeGrowthGlobal1X128, false)
    tickUpdate(tu, liquidity, this.s.tick, tickUpper, this.s.feeGrowthGlobal0X128, this.s.feeGrowthGlobal1X128, true)
    this.s.ticks[tickLower] = tl
    this.s.ticks[tickUpper] = tu
    if (tickLower <= this.s.tick && this.s.tick < tickUpper) this.s.liquidity += liquidity
    const inside = getFeeGrowthInside(tl, tu, tickLower, tickUpper, this.s.tick, this.s.feeGrowthGlobal0X128, this.s.feeGrowthGlobal1X128)
    const key = `${owner}:${tickLower}:${tickUpper}`
    const pos: PositionState = this.s.positions[key] ?? newPosition()
    posUpdate(pos, liquidity, inside.feeGrowthInside0X128, inside.feeGrowthInside1X128)
    this.s.positions[key] = pos
    const amounts = getAmountsForLiquidity(this.s.sqrtPriceX96, tickLower, tickUpper, liquidity)
    return { liquidity, amount0: amounts.amount0, amount1: amounts.amount1 }
  }

  swap(amountSpecified: bigint, zeroForOne: boolean): V3SwapResult {
    const exactIn = amountSpecified >= 0n
    let sqrtPriceX96 = this.s.sqrtPriceX96
    let tickCurrent = this.s.tick
    let liquidity = this.s.liquidity
    let amountRemaining = amountSpecified
    let amountInAcc = 0n, amountOutAcc = 0n, feeAcc = 0n
    const crossed: number[] = []
    const sqrtPriceStart = sqrtPriceX96 // 修正 C4：循环前捕获

    let guard = 0
    while (amountRemaining !== 0n && liquidity > 0n && guard < 1000) {
      guard++
      // 下一个 tick 边界（按 tickSpacing）
      let tickTarget: number
      if (zeroForOne) {
        tickTarget = Math.floor(tickCurrent / this.tickSpacing) * this.tickSpacing
        if (tickTarget >= tickCurrent) tickTarget -= this.tickSpacing
      } else {
        tickTarget = (Math.floor(tickCurrent / this.tickSpacing) + 1) * this.tickSpacing
      }
      const sqrtTarget = getSqrtRatioAtTick(tickTarget)
      const step = computeSwapStep(sqrtPriceX96, sqrtTarget, liquidity, amountRemaining, this.fee)
      sqrtPriceX96 = step.sqrtPriceNextX96
      amountInAcc += step.amountIn
      amountOutAcc += step.amountOut
      feeAcc += step.feeAmount
      amountRemaining = exactIn
        ? amountRemaining - step.amountIn - step.feeAmount
        : amountRemaining + step.amountOut

      if (sqrtPriceX96 === sqrtTarget) {
        // 修正 C3：cross 目标 tick，tickCurrent = target-1(zeroForOne) / target
        const ti = this.s.ticks[tickTarget]
        if (ti?.initialized) {
          const net = tickCross(ti, this.s.feeGrowthGlobal0X128, this.s.feeGrowthGlobal1X128)
          liquidity = zeroForOne ? liquidity - net : liquidity + net
          crossed.push(tickTarget)
        }
        tickCurrent = zeroForOne ? tickTarget - 1 : tickTarget
        if (liquidity <= 0n) break
      }
    }
    const tickEnd = getTickAtSqrtRatio(sqrtPriceX96)
    this.s.sqrtPriceX96 = sqrtPriceX96
    this.s.tick = tickEnd
    this.s.liquidity = liquidity
    if (feeAcc > 0n) {
      if (zeroForOne) this.s.feeGrowthGlobal0X128 = growFeeGlobal(this.s.feeGrowthGlobal0X128, feeAcc, this.s.liquidity > 0n ? this.s.liquidity : 1n)
      else this.s.feeGrowthGlobal1X128 = growFeeGlobal(this.s.feeGrowthGlobal1X128, feeAcc, this.s.liquidity > 0n ? this.s.liquidity : 1n)
    }
    // 修正 C4：用 start vs end 算 priceImpact
    const pStart = formatSqrtPriceX96(sqrtPriceStart)
    const pEnd = formatSqrtPriceX96(sqrtPriceX96)
    const priceImpactBps = pStart > 0 ? Math.abs((pEnd - pStart) / pStart) * 10000 : 0
    return { amountIn: amountInAcc, amountOut: amountOutAcc, sqrtPriceX96End: sqrtPriceX96, tickEnd, tickCrossed: crossed, feeAmount: feeAcc, priceImpactBps }
  }

  // 深拷贝快照（供可视化读取，与 pool.s 独立）。
  // structuredClone 原生支持 bigint（Node 17+ / 现代浏览器），保留全部精度。
  snapshot(): PoolSnapshot {
    return structuredClone(this.s)
  }
}
