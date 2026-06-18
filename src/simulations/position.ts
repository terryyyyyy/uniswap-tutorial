// Position 状态 + LiquidityAmounts 换算（对照 Position.sol + periphery LiquidityAmounts.sol）
import { mulDiv } from './fullMath'
import { Q96, Q128 } from '@/constants/uniswap'
import { getSqrtRatioAtTick } from './tickMath'

export interface PositionState {
  liquidity: bigint
  feeGrowthInside0LastX128: bigint
  feeGrowthInside1LastX128: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
}
export const newPosition = (): PositionState => ({
  liquidity: 0n, feeGrowthInside0LastX128: 0n, feeGrowthInside1LastX128: 0n,
  tokensOwed0: 0n, tokensOwed1: 0n,
})

// 对照 Position.sol:44-87 update
// 手续费按更新前的流动性（_self.liquidity）累计
export function update(
  pos: PositionState, liquidityDelta: bigint,
  feeGrowthInside0X128: bigint, feeGrowthInside1X128: bigint,
): void {
  const liquidityBefore = pos.liquidity
  const owed0 = mulDiv(feeGrowthInside0X128 - pos.feeGrowthInside0LastX128, liquidityBefore, Q128)
  const owed1 = mulDiv(feeGrowthInside1X128 - pos.feeGrowthInside1LastX128, liquidityBefore, Q128)
  pos.liquidity = liquidityBefore + liquidityDelta
  pos.feeGrowthInside0LastX128 = feeGrowthInside0X128
  pos.feeGrowthInside1LastX128 = feeGrowthInside1X128
  pos.tokensOwed0 += owed0
  pos.tokensOwed1 += owed1
}

// === LiquidityAmounts（对照 v3-periphery/contracts/libraries/LiquidityAmounts.sol）===

// .sol: mulDiv(liquidity << 96, sqrtB - sqrtA, sqrtB) / sqrtA
export function getAmount0ForLiquidity(sqrtA: bigint, sqrtB: bigint, L: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  return mulDiv(L << 96n, sqrtB - sqrtA, sqrtB) / sqrtA
}

// .sol: mulDiv(liquidity, sqrtB - sqrtA, Q96)
export function getAmount1ForLiquidity(sqrtA: bigint, sqrtB: bigint, L: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  return mulDiv(L, sqrtB - sqrtA, Q96)
}

// .sol: getAmountsForLiquidity
export function getAmountsForLiquiditySqrt(sqrtCur: bigint, sqrtA: bigint, sqrtB: bigint, L: bigint): { amount0: bigint; amount1: bigint } {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  if (sqrtCur <= sqrtA) return { amount0: getAmount0ForLiquidity(sqrtA, sqrtB, L), amount1: 0n }
  if (sqrtCur < sqrtB) return { amount0: getAmount0ForLiquidity(sqrtCur, sqrtB, L), amount1: getAmount1ForLiquidity(sqrtA, sqrtCur, L) }
  return { amount0: 0n, amount1: getAmount1ForLiquidity(sqrtA, sqrtB, L) }
}

export function getAmountsForLiquidity(sqrtCur: bigint, tickLower: number, tickUpper: number, L: bigint) {
  return getAmountsForLiquiditySqrt(sqrtCur, getSqrtRatioAtTick(tickLower), getSqrtRatioAtTick(tickUpper), L)
}

// .sol: intermediate = mulDiv(sqrtA, sqrtB, Q96); liquidity = mulDiv(amount0, intermediate, sqrtB - sqrtA)
// 注意：无 <<96（与 amount0 = L·2^96·(b-a)/(a·b) 严格互逆）
export function getLiquidityForAmount0(sqrtA: bigint, sqrtB: bigint, amount0: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  const intermediate = mulDiv(sqrtA, sqrtB, Q96)
  return mulDiv(amount0, intermediate, sqrtB - sqrtA)
}

// .sol: mulDiv(amount1, Q96, sqrtB - sqrtA)
export function getLiquidityForAmount1(sqrtA: bigint, sqrtB: bigint, amount1: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  return mulDiv(amount1, Q96, sqrtB - sqrtA)
}

// .sol: getLiquidityForAmounts
export function getLiquidityForAmounts(sqrtCur: bigint, sqrtA: bigint, sqrtB: bigint, amount0: bigint, amount1: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  if (sqrtCur <= sqrtA) return getLiquidityForAmount0(sqrtA, sqrtB, amount0)
  if (sqrtCur < sqrtB) {
    const l0 = getLiquidityForAmount0(sqrtCur, sqrtB, amount0)
    const l1 = getLiquidityForAmount1(sqrtA, sqrtCur, amount1)
    return l0 < l1 ? l0 : l1
  }
  return getLiquidityForAmount1(sqrtA, sqrtB, amount1)
}
