import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import { Q96 } from '@/constants/uniswap'
import { mulDivRoundingUp } from '@/simulations/fullMath'
import {
  getAmount0Delta, getAmount1Delta, getNextSqrtPriceFromInput, getNextSqrtPriceFromOutput,
} from '@/simulations/sqrtPriceMath'

export const coreCommit = '59d3ecf53afa9264a16bba0e38f4c5d2231f80bc'
export const peripheryCommit = 'c6e4754dab11bd38c6f08ac51c3c868569e93d64'
export const dynamicFeeFlag = 0x800000
export const overrideFlag = 0x400000
export const maxFee = 1_000_000

export function poolIdentity(native: boolean, useHook: boolean, dynamic: boolean, tickSpacing: number) {
  const currency0 = native ? 0n : 1n
  const hook = useHook ? 0x80n : 0n
  const words = [currency0, 2n, BigInt(dynamic ? dynamicFeeFlag : 3000), BigInt(tickSpacing), hook]
    .map(value => value.toString(16).padStart(64, '0'))
  return {
    words,
    id: '0x' + bytesToHex(keccak_256(hexToBytes(words.join('')))),
    validHook: !dynamic || useHook,
  }
}

// TickMath.getSqrtPriceAtTick fixtures for the two initialized boundaries and the nearer limit.
const negativePrices = { tick: 78754240422856966435523493930n, limit: 78990846045029531151608375686n }
const positivePrices = { tick: 79704936542881920863903188246n, limit: 79466191966197645195421774833n }

export function sampleSwapStep(amountSpecified: bigint, zeroForOne: boolean, nearLimit: boolean) {
  const fee = 3000n
  const denominator = BigInt(maxFee)
  const liquidity = 1_000_000n
  const price = Q96
  const prices = zeroForOne ? negativePrices : positivePrices
  const target = nearLimit ? prices.limit : prices.tick
  const inputTo = (next: bigint) => zeroForOne
    ? getAmount0Delta(next, price, liquidity, true)
    : getAmount1Delta(price, next, liquidity, true)
  const outputFrom = (next: bigint) => zeroForOne
    ? getAmount1Delta(next, price, liquidity, false)
    : getAmount0Delta(price, next, liquidity, false)

  let next = target
  let amountIn: bigint
  let amountOut: bigint
  let feeAmount: bigint
  if (amountSpecified < 0n) {
    const available = -amountSpecified * (denominator - fee) / denominator
    amountIn = inputTo(target)
    if (available < amountIn) {
      amountIn = available
      next = getNextSqrtPriceFromInput(price, liquidity, amountIn, zeroForOne)
      feeAmount = -amountSpecified - amountIn
    } else {
      feeAmount = mulDivRoundingUp(amountIn, fee, denominator - fee)
    }
    amountOut = outputFrom(next)
  } else {
    amountOut = outputFrom(target)
    if (amountSpecified < amountOut) {
      amountOut = amountSpecified
      next = getNextSqrtPriceFromOutput(price, liquidity, amountOut, zeroForOne)
    }
    amountIn = inputTo(next)
    feeAmount = mulDivRoundingUp(amountIn, fee, denominator - fee)
  }

  const totalIn = amountIn + feeAmount
  const remaining = amountSpecified < 0n ? amountSpecified + totalIn : amountSpecified - amountOut
  return {
    next, target, amountIn, amountOut, feeAmount, remaining,
    delta0: zeroForOne ? -totalIn : amountOut,
    delta1: zeroForOne ? amountOut : -totalIn,
    stop: next !== target ? 'amount' : nearLimit ? 'limit' : 'tick',
  } as const
}

export function swapHookFlags(before: boolean, beforeDelta: boolean, after: boolean, afterDelta: boolean) {
  const mask = (before ? 0x80 : 0) | (beforeDelta ? 0x08 : 0) | (after ? 0x40 : 0) | (afterDelta ? 0x04 : 0)
  return { mask, valid: (!beforeDelta || before) && (!afterDelta || after) }
}

export function effectiveFee(dynamic: boolean, override: boolean, stored: number, returned: number, protocolFee: number) {
  const fee = dynamic && override ? returned : stored
  return { fee, total: protocolFee + fee - Math.floor(protocolFee * fee / maxFee) }
}

export function liquidityAt(tick: number) {
  if (tick >= -120 && tick < 60) return 1_000_000
  if (tick >= 60 && tick < 180) return 400_000
  return 0
}

export const settlementStages = [
  { label: 'unlock', deltas: [0, 0, 0] },
  { label: 'swap A/B', deltas: [-100, 95, 0] },
  { label: 'swap B/C', deltas: [-100, 0, 90] },
  { label: 'settle / take', deltas: [0, 0, 0] },
] as const
