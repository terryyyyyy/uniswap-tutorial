// Tick 状态复刻（对照 v3-core/contracts/libraries/Tick.sol）
export interface TickInfo {
  liquidityGross: bigint
  liquidityNet: bigint
  feeGrowthOutside0X128: bigint
  feeGrowthOutside1X128: bigint
  initialized: boolean
}
export const newTickInfo = (): TickInfo => ({
  liquidityGross: 0n, liquidityNet: 0n,
  feeGrowthOutside0X128: 0n, feeGrowthOutside1X128: 0n, initialized: false,
})

// 对照 Tick.sol:110-150 update
export function update(
  info: TickInfo, liquidityDelta: bigint, tickCurrent: number, tick: number,
  feeGrowthGlobal0X128: bigint, feeGrowthGlobal1X128: bigint, upper: boolean,
): void {
  const liquidityGrossBefore = info.liquidityGross
  const liquidityGrossAfter = liquidityGrossBefore + liquidityDelta

  if (liquidityGrossBefore === 0n) {
    // 约定：tick 初始化前的所有增长都发生在 tick 下方
    // tick <= tickCurrent → feeGrowthOutside = global；否则 0
    if (tick <= tickCurrent) {
      info.feeGrowthOutside0X128 = feeGrowthGlobal0X128
      info.feeGrowthOutside1X128 = feeGrowthGlobal1X128
    }
    info.initialized = true
  }
  info.liquidityGross = liquidityGrossAfter

  // 下（上）边界从左到右（右到左）穿越时，流动性被加（减）
  info.liquidityNet = upper
    ? info.liquidityNet - liquidityDelta
    : info.liquidityNet + liquidityDelta
}

// 对照 Tick.sol:168-184 cross
export function cross(info: TickInfo, feeGrowthGlobal0X128: bigint, feeGrowthGlobal1X128: bigint): bigint {
  info.feeGrowthOutside0X128 = feeGrowthGlobal0X128 - info.feeGrowthOutside0X128
  info.feeGrowthOutside1X128 = feeGrowthGlobal1X128 - info.feeGrowthOutside1X128
  return info.liquidityNet
}

// 对照 Tick.sol:60-95 getFeeGrowthInside
// below: tickCurrent >= tickLower → lower.outside；否则 global - lower.outside
// above: tickCurrent <  tickUpper → upper.outside；否则 global - upper.outside
// inside = global - below - above
export function getFeeGrowthInside(
  tickLowerInfo: TickInfo, tickUpperInfo: TickInfo,
  tickLower: number, tickUpper: number, tickCurrent: number,
  feeGrowthGlobal0X128: bigint, feeGrowthGlobal1X128: bigint,
): { feeGrowthInside0X128: bigint; feeGrowthInside1X128: bigint } {
  const feeGrowthBelow0 = tickCurrent >= tickLower
    ? tickLowerInfo.feeGrowthOutside0X128
    : feeGrowthGlobal0X128 - tickLowerInfo.feeGrowthOutside0X128
  const feeGrowthBelow1 = tickCurrent >= tickLower
    ? tickLowerInfo.feeGrowthOutside1X128
    : feeGrowthGlobal1X128 - tickLowerInfo.feeGrowthOutside1X128
  const feeGrowthAbove0 = tickCurrent < tickUpper
    ? tickUpperInfo.feeGrowthOutside0X128
    : feeGrowthGlobal0X128 - tickUpperInfo.feeGrowthOutside0X128
  const feeGrowthAbove1 = tickCurrent < tickUpper
    ? tickUpperInfo.feeGrowthOutside1X128
    : feeGrowthGlobal1X128 - tickUpperInfo.feeGrowthOutside1X128
  return {
    feeGrowthInside0X128: feeGrowthGlobal0X128 - feeGrowthBelow0 - feeGrowthAbove0,
    feeGrowthInside1X128: feeGrowthGlobal1X128 - feeGrowthBelow1 - feeGrowthAbove1,
  }
}
