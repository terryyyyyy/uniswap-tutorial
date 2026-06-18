// 手续费模拟（对照 v3-core feeGrowth 累计 + LP 分配）
import { mulDiv } from './fullMath'
import { Q128 } from '@/constants/uniswap'

// 全局 feeGrowth 增量 = feeAmount * 2^128 / liquidity
// 对照 UniswapV3Pool.sol: feeGrowthGlobalX128 += FullMath.mulDiv(feeAmount, Q128, liquidity)
export function growFeeGlobal(fgX128: bigint, feeAmount: bigint, liquidity: bigint): bigint {
  if (liquidity === 0n) return fgX128
  return fgX128 + mulDiv(feeAmount, Q128, liquidity)
}

// 某 position 累计应得手续费 = (feeGrowthInside - last) * liquidity / 2^128
// 对照 Position.sol: tokensOwed = mulDiv(feeGrowthInside - feeGrowthInsideLast, liquidity, Q128)
export function positionFeeOwed(fgInsideX128: bigint, fgInsideLastX128: bigint, liquidity: bigint): bigint {
  return mulDiv(fgInsideX128 - fgInsideLastX128, liquidity, Q128)
}

// 多 LP 按流动性比例分配（模拟用，pool 内部用 feeGrowthInside 隐式完成）
export function distributeFee(totalFee: bigint, lps: { liquidity: bigint }[]): bigint[] {
  const total = lps.reduce((s, l) => s + l.liquidity, 0n)
  if (total === 0n) return lps.map(() => 0n)
  return lps.map((l) => (totalFee * l.liquidity) / total)
}
