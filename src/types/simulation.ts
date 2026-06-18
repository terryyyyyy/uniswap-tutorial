// 模拟引擎所有结果类型（BigInt 精确计算）

export interface SwapResult {
  amountOut: bigint
  amountIn: bigint
  newReserveX: bigint
  newReserveY: bigint
  priceImpactBps: number // 基点
  feeAmount: bigint
}

export interface LiquidityResult {
  liquidity: bigint
  amountX: bigint
  amountY: bigint
}

export interface SwapStepResult {
  sqrtPriceNextX96: bigint
  amountIn: bigint
  amountOut: bigint
  feeAmount: bigint
}

export interface V3SwapResult {
  amountOut: bigint
  amountIn: bigint
  sqrtPriceX96End: bigint
  tickEnd: number
  tickCrossed: number[]
  feeAmount: bigint
  priceImpactBps: number
}

export interface FeeResult {
  feeGrowthGlobal: bigint
  feeAmount: bigint
}

export interface PositionAmounts {
  amount0: bigint
  amount1: bigint
}

export interface SandboxResult {
  success: boolean
  output: any // 函数返回值（已反序列化，bigint 还原）
  logs: string[] // console.log 输出
  error?: string // 错误信息
  duration: number // 执行时间(ms)
}

export interface TickSnapshot {
  liquidityNet: bigint
  liquidityGross: bigint
  feeGrowthOutside0X128: bigint
  feeGrowthOutside1X128: bigint
  initialized: boolean
}

export interface PositionSnapshot {
  liquidity: bigint
  feeGrowthInside0LastX128: bigint
  feeGrowthInside1LastX128: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
}

export interface PoolSnapshot {
  sqrtPriceX96: bigint
  tick: number
  liquidity: bigint
  feeGrowthGlobal0X128: bigint
  feeGrowthGlobal1X128: bigint
  ticks: Record<number, TickSnapshot>
  positions: Record<string, PositionSnapshot>
}
