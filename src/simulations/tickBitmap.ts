// TickBitmap 复刻（对照 v3-core/contracts/libraries/TickBitmap.sol）
// 关键：256 个 tick/word（compressed >> 8, compressed & 255），不是 32。
// !lte（向右）搜索从 position(compressed + 1) 起，不含当前 tick（对照 TickBitmap.sol:63-76）。
import { mostSignificantBit, leastSignificantBit } from './bitMath'

export interface BitmapState { [wordPos: number]: bigint }

// 对应合约: int24 compressed = tick / tickSpacing; if (tick<0 && tick%tickSpacing!=0) compressed--;
// 即向负无穷取整。Math.trunc 向零取整后对负数非整除再 -1，与合约逐位等价。
function compress(tick: number, tickSpacing: number): number {
  const trunc = Math.trunc(tick / tickSpacing)
  if (tick < 0 && tick % tickSpacing !== 0) return trunc - 1
  return trunc
}

export function position(tick: number, tickSpacing: number): { wordPos: number; bitPos: number } {
  const compressed = compress(tick, tickSpacing)
  // 合约: wordPos = int16(tick >> 8); bitPos = uint8(tick % 256)
  // JS: >> 为算术右移（保留符号），& 255 对负数给出 0..255（与 uint8(tick%256) 一致）
  return { wordPos: compressed >> 8, bitPos: compressed & 255 }
}

export function flipInitialized(bitmap: BitmapState, tick: number, tickSpacing: number): BitmapState {
  const { wordPos, bitPos } = position(tick, tickSpacing)
  const mask = 1n << BigInt(bitPos)
  return { ...bitmap, [wordPos]: (bitmap[wordPos] ?? 0n) ^ mask }
}

// lte=true: 找 <= tick 的最近已初始化 tick（向左，含当前）
// lte=false: 找 > tick 的最近已初始化 tick（向右，从 compressed+1 起，不含当前 tick）
// 逐行对照 TickBitmap.sol:42-77
export function nextInitializedTickWithinOneWord(
  bitmap: BitmapState, tick: number, tickSpacing: number, lte: boolean,
): { next: number; initialized: boolean } {
  const compressed = compress(tick, tickSpacing)

  if (lte) {
    const wordPos = compressed >> 8
    const bitPos = compressed & 255
    const word = bitmap[wordPos] ?? 0n
    // mask = (1 << bitPos) - 1 + (1 << bitPos) = (1 << (bitPos+1)) - 1，覆盖 [0..bitPos]
    const mask = (1n << BigInt(bitPos + 1)) - 1n
    const masked = word & mask
    if (masked !== 0n) {
      const msb = mostSignificantBit(masked)
      // next = (compressed - (bitPos - msb)) * tickSpacing
      return { next: (compressed - (bitPos - msb)) * tickSpacing, initialized: true }
    }
    // 无已初始化 tick：返回当前 word 的最左（最小）tick = (compressed - bitPos) * tickSpacing
    return { next: (compressed - bitPos) * tickSpacing, initialized: false }
  } else {
    // 从下一个 tick 所在 word 起搜（当前 tick 状态无关）
    const c1 = compressed + 1
    const wordPos = c1 >> 8
    const bitPos = c1 & 255
    const word = bitmap[wordPos] ?? 0n
    // mask = ~((1 << bitPos) - 1)，覆盖 [bitPos..255]
    const mask = ~((1n << BigInt(bitPos)) - 1n)
    const masked = word & mask
    if (masked !== 0n) {
      const lsb = leastSignificantBit(masked)
      // next = (compressed + 1 + (lsb - bitPos)) * tickSpacing
      return { next: (c1 + (lsb - bitPos)) * tickSpacing, initialized: true }
    }
    // 无已初始化 tick：返回当前 word 的最右（最大）tick = (compressed + 1 + (255 - bitPos)) * tickSpacing
    return { next: (c1 + (255 - bitPos)) * tickSpacing, initialized: false }
  }
}
