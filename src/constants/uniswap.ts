// Uniswap V3 常量（数值严格对齐合约）

export const Q96 = 2n ** 96n // FixedPoint96.Q96
export const Q128 = 2n ** 128n

export const MIN_TICK = -887272
export const MAX_TICK = 887272

export const MIN_SQRT_RATIO = 4295128739n // TickMath.MIN_SQRT_RATIO
export const MAX_SQRT_RATIO =
  1461446703485210103287273052203988822378723970342n // TickMath.MAX_SQRT_RATIO

// fee (hundredths of a bip) → tickSpacing
export const FEE_TIERS = [
  { fee: 100, feeBps: 1, tickSpacing: 1, label: '0.01%' },
  { fee: 500, feeBps: 5, tickSpacing: 10, label: '0.05%' },
  { fee: 3000, feeBps: 30, tickSpacing: 60, label: '0.3%' },
  { fee: 10000, feeBps: 100, tickSpacing: 200, label: '1%' },
] as const

export const TICK_SPACING_TO_FEE: Record<number, number> = Object.fromEntries(
  FEE_TIERS.map((t) => [t.tickSpacing, t.fee]),
)
