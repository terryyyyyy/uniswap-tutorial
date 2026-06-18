// SwapMath.computeSwapStep 复刻（对照 v3-core/contracts/libraries/SwapMath.sol）
// 关键：zeroForOne 时 amountIn=getAmount0Delta(token0), amountOut=getAmount1Delta(token1)
import { mulDiv, mulDivRoundingUp } from './fullMath'
import { getAmount0Delta, getAmount1Delta, getNextSqrtPriceFromInput, getNextSqrtPriceFromOutput } from './sqrtPriceMath'

export interface SwapStepResult {
  sqrtPriceNextX96: bigint
  amountIn: bigint
  amountOut: bigint
  feeAmount: bigint
}

export function computeSwapStep(
  sqrtRatioCurrentX96: bigint,
  sqrtRatioTargetX96: bigint,
  liquidity: bigint,
  amountRemaining: bigint,
  feePips: number,
): SwapStepResult {
  const zeroForOne = sqrtRatioCurrentX96 >= sqrtRatioTargetX96
  const exactIn = amountRemaining >= 0n
  const amountRemainingAbs = amountRemaining < 0n ? -amountRemaining : amountRemaining

  let sqrtRatioNextX96: bigint
  let amountIn = 0n
  let amountOut = 0n

  if (exactIn) {
    const amountRemainingLessFee = mulDiv(amountRemainingAbs, 1_000_000n - BigInt(feePips), 1_000_000n)
    const inIfReach = zeroForOne
      ? getAmount0Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, true)
      : getAmount1Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, true)
    if (amountRemainingLessFee >= inIfReach) {
      sqrtRatioNextX96 = sqrtRatioTargetX96
    } else {
      sqrtRatioNextX96 = getNextSqrtPriceFromInput(sqrtRatioCurrentX96, liquidity, amountRemainingLessFee, zeroForOne)
    }
  } else {
    const outIfReach = zeroForOne
      ? getAmount1Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, false)
      : getAmount0Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, false)
    if (amountRemainingAbs >= outIfReach) {
      sqrtRatioNextX96 = sqrtRatioTargetX96
    } else {
      sqrtRatioNextX96 = getNextSqrtPriceFromOutput(sqrtRatioCurrentX96, liquidity, amountRemainingAbs, zeroForOne)
    }
  }

  const max = sqrtRatioTargetX96 === sqrtRatioNextX96

  if (zeroForOne) {
    amountIn = max && exactIn
      ? getAmount0Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, true)
      : getAmount0Delta(sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, true)
    amountOut = max && !exactIn
      ? getAmount1Delta(sqrtRatioTargetX96, sqrtRatioCurrentX96, liquidity, false)
      : getAmount1Delta(sqrtRatioNextX96, sqrtRatioCurrentX96, liquidity, false)
  } else {
    amountIn = max && exactIn
      ? getAmount1Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, true)
      : getAmount1Delta(sqrtRatioCurrentX96, sqrtRatioNextX96, liquidity, true)
    amountOut = max && !exactIn
      ? getAmount0Delta(sqrtRatioCurrentX96, sqrtRatioTargetX96, liquidity, false)
      : getAmount0Delta(sqrtRatioCurrentX96, sqrtRatioNextX96, liquidity, false)
  }

  if (!exactIn && amountOut > amountRemainingAbs) amountOut = amountRemainingAbs

  let feeAmount: bigint
  if (exactIn && sqrtRatioNextX96 !== sqrtRatioTargetX96) {
    feeAmount = amountRemainingAbs - amountIn
  } else {
    feeAmount = mulDivRoundingUp(amountIn, BigInt(feePips), 1_000_000n - BigInt(feePips))
  }
  return { sqrtPriceNextX96: sqrtRatioNextX96, amountIn, amountOut, feeAmount }
}
