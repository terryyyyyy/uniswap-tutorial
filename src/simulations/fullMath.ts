// FullMath.mulDiv 复刻（对照 v3-core/contracts/libraries/FullMath.sol）
// JS BigInt 天然大整数，无需 Solidity overflow 检查，仅保留取整方向。

export function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('FullMath: DIV_BY_ZERO')
  return (a * b) / denominator
}

export function mulDivRoundingUp(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('FullMath: DIV_BY_ZERO')
  const product = a * b
  const result = product / denominator
  return product % denominator !== 0n ? result + 1n : result
}
