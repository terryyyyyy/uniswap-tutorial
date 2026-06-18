// V2 AMM (x*y=k) 用于 Ch1/Ch2 对比（恒定乘积做市商）
import type { SwapResult } from '@/types/simulation'

export class AMMSimulator {
  reserveX: bigint
  reserveY: bigint
  constructor(x: bigint, y: bigint) { this.reserveX = x; this.reserveY = y }
  get price(): number { return Number(this.reserveY) / Number(this.reserveX) }
  get k(): bigint { return this.reserveX * this.reserveY }

  swap(amountIn: bigint, zeroForOne: boolean, feeBps = 30): SwapResult {
    const feeAmount = (amountIn * BigInt(feeBps)) / 10000n
    const amountInNet = amountIn - feeAmount
    const oldPrice = this.price
    let amountOut: bigint
    if (zeroForOne) {
      amountOut = (amountInNet * this.reserveY) / (this.reserveX + amountInNet)
      this.reserveX += amountIn
      this.reserveY -= amountOut
    } else {
      amountOut = (amountInNet * this.reserveX) / (this.reserveY + amountInNet)
      this.reserveY += amountIn
      this.reserveX -= amountOut
    }
    const newPrice = this.price
    const priceImpactBps = Math.abs((newPrice - oldPrice) / oldPrice) * 10000
    return { amountOut, amountIn, newReserveX: this.reserveX, newReserveY: this.reserveY, priceImpactBps, feeAmount }
  }

  addLiquidity(amountX: bigint, amountY: bigint) {
    this.reserveX += amountX
    this.reserveY += amountY
    return { sqrtK: BigInt(Math.floor(Math.sqrt(Number(this.k)))), amountX, amountY }
  }
}
