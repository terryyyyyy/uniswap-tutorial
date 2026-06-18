// SqrtPriceMath 复刻（对照 v3-core/contracts/libraries/SqrtPriceMath.sol）
// 关键：getAmount0Delta 用 (L<<96)*Δ/(sqrtB*sqrtA) 形式，getAmount1Delta 用 L*Δ/Q96 形式。
// 注意：getNextSqrtPriceFromAmount0RoundingUp 的两条分支均严格对齐合约——
//   add 分支: mulDivRoundingUp(L<<96, sqrtP, (L<<96) + amount*sqrtP)
//   !add 分支: mulDivRoundingUp(L<<96, sqrtP, (L<<96) - amount*sqrtP)   ← 必须用 numerator1(L<<96) 而非 liquidity(L)
import { mulDiv, mulDivRoundingUp } from './fullMath'
import { Q96 } from '@/constants/uniswap'
import { divCeil } from '@/utils/math'

// token0 的数量变化 = (L<<96) * Δsqrt / (sqrtB * sqrtA)
export function getAmount0Delta(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, liquidity: bigint, roundUp: boolean): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  if (sqrtRatioAX96 === 0n) throw new Error('SqrtPriceMath: sqrtA=0')
  const numerator1 = liquidity << 96n
  const numerator2 = sqrtRatioBX96 - sqrtRatioAX96
  // 合约: roundUp ? divRoundingUp(mulDivRoundingUp(n1,n2,sqrtB), sqrtA) : mulDiv(n1,n2,sqrtB)/sqrtA
  if (roundUp) {
    return divCeil(mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96), sqrtRatioAX96)
  }
  return mulDiv(numerator1, numerator2, sqrtRatioBX96) / sqrtRatioAX96
}

// token1 的数量变化 = L * Δsqrt / Q96
export function getAmount1Delta(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, liquidity: bigint, roundUp: boolean): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  return roundUp
    ? mulDivRoundingUp(liquidity, sqrtRatioBX96 - sqrtRatioAX96, Q96)
    : mulDiv(liquidity, sqrtRatioBX96 - sqrtRatioAX96, Q96)
}

// 对齐 SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp：始终向上取整
export function getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96: bigint, liquidity: bigint, amount: bigint, add: boolean): bigint {
  // 合约短路：amount==0 时直接返回原价（否则后续除法会除零）
  if (amount === 0n) return sqrtPX96
  const numerator1 = liquidity << 96n

  if (add) {
    const product = amount * sqrtPX96
    // JS BigInt 无溢出：product / amount === sqrtPX96 恒成立，denominator >= numerator1 恒成立
    const denominator = numerator1 + product
    if (denominator >= numerator1) {
      return mulDivRoundingUp(numerator1, sqrtPX96, denominator)
    }
    // 回退路径（JS 中因无溢出实际不可达，保留以对齐合约结构）
    return divCeil(numerator1, numerator1 / sqrtPX96 + amount)
  } else {
    const product = amount * sqrtPX96
    if (numerator1 <= product) throw new Error('SqrtPriceMath: price underflow')
    const denominator = numerator1 - product
    return mulDivRoundingUp(numerator1, sqrtPX96, denominator)
  }
}

// 对齐 SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown：始终向下取整
export function getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96: bigint, liquidity: bigint, amount: bigint, add: boolean): bigint {
  if (add) {
    const quotient = (amount << 96n) / liquidity
    return sqrtPX96 + quotient
  } else {
    const quotient = mulDivRoundingUp(amount, Q96, liquidity)
    return sqrtPX96 - quotient
  }
}

export function getNextSqrtPriceFromInput(sqrtPX96: bigint, liquidity: bigint, amountIn: bigint, zeroForOne: boolean): bigint {
  return zeroForOne
    ? getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountIn, true)
    : getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountIn, true)
}

export function getNextSqrtPriceFromOutput(sqrtPX96: bigint, liquidity: bigint, amountOut: bigint, zeroForOne: boolean): bigint {
  return zeroForOne
    ? getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountOut, false)
    : getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountOut, false)
}
