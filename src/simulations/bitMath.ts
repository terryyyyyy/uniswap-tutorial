// BitMath 复刻（对照 v3-core/contracts/libraries/BitMath.sol）

export function mostSignificantBit(x: bigint): number {
  if (x <= 0n) throw new Error('BitMath: zero')
  let r = 0
  let v = x
  while (v > 1n) {
    v >>= 1n
    r++
  }
  return r
}

export function leastSignificantBit(x: bigint): number {
  if (x <= 0n) throw new Error('BitMath: zero')
  let r = 0
  let v = x
  while ((v & 1n) === 0n) {
    v >>= 1n
    r++
  }
  return r
}
