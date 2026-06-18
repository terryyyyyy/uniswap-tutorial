import { Q96 } from '@/constants/uniswap'

// 先在 BigInt 域完成除法，再转为 Number，避免精度丢失
export function formatBigInt(value: bigint, decimals = 18): number {
  return Number(value / 10n ** BigInt(decimals))
}

// sqrtPriceX96 → price，分阶段除法避免 Number 溢出
// price = (sqrtPrice / 2^96)^2
export function formatSqrtPriceX96(sqrtPriceX96: bigint): number {
  // 先右移 64 位（除以 2^64），再除以 2^32，得 sqrtPrice/2^96
  const ratio = Number(sqrtPriceX96 / (1n << 64n)) / 2 ** 32
  return ratio * ratio
}

export function sqrtPriceToPrice(sqrtPriceX96: bigint): number {
  return formatSqrtPriceX96(sqrtPriceX96)
}
