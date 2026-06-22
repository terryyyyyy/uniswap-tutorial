import { AMMSimulator } from '@/simulations/amm'
import { PoolSimulator } from '@/simulations/pool'
import { getSqrtRatioAtTick, getTickAtSqrtRatio, priceToTick, tickToPrice } from '@/simulations/tickMath'
import { computeSwapStep } from '@/simulations/swapMath'
import { getLiquidityForAmounts, getAmountsForLiquidity } from '@/simulations/position'
import { growFeeGlobal, distributeFee, positionFeeOwed } from '@/simulations/fee'
import { Q96 } from '@/constants/uniswap'

export const sandboxApi = {
  Q96,
  ammSwap: (rx: bigint, ry: bigint, amountIn: bigint, zeroForOne: boolean) =>
    new AMMSimulator(rx, ry).swap(amountIn, zeroForOne),
  ammAddLiquidity: (rx: bigint, ry: bigint, ax: bigint, ay: bigint) =>
    new AMMSimulator(rx, ry).addLiquidity(ax, ay),
  priceToTick,
  tickToPrice,
  getSqrtRatioAtTick,
  getTickAtSqrtRatio,
  computeSwapStep,
  getLiquidityForAmounts: (tickLower: number, tickUpper: number, a0: bigint, a1: bigint) =>
    getLiquidityForAmounts(Q96, getSqrtRatioAtTick(tickLower), getSqrtRatioAtTick(tickUpper), a0, a1),
  getAmountsForLiquidity: (tickLower: number, tickUpper: number, L: bigint) =>
    getAmountsForLiquidity(Q96, tickLower, tickUpper, L),
  calculateFeeGrowth: growFeeGlobal,
  calculateLPShare: distributeFee,
  calculatePositionFee: positionFeeOwed,
  createPool: (token0: string, token1: string, fee: number) => new PoolSimulator(token0, token1, fee),
}
export type SandboxApi = typeof sandboxApi
