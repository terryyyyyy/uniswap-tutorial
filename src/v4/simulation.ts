import { AMMSimulator } from '@/simulations/amm'

const unit = 1_000_000n
const initialPrice = 2_000

export function quoteEth(amount: number) {
  const pool = new AMMSimulator(20_000n * unit, 10n * unit)
  const { amountOut, feeAmount } = pool.swap(BigInt(amount) * unit, true)
  const eth = Number(amountOut) / Number(unit)
  const fee = Number(feeAmount) / Number(unit)
  const averagePrice = amount / eth
  const priceImpact = ((amount - fee) / eth / initialPrice - 1) * 100
  return { eth, fee, averagePrice, priceImpact }
}

export const rangePresets = [
  { label: '窄区间', lower: 1900, upper: 2100 },
  { label: '中等区间', lower: 1800, upper: 2200 },
  { label: '宽区间', lower: 1650, upper: 2350 },
] as const

export function rangeState(price: number, lower: number, upper: number) {
  if (price < lower) return 'below'
  if (price >= upper) return 'above'
  return 'active'
}

export const fixedFee = 3000

export function dynamicFee(volatility: number) {
  return 500 + 75 * volatility
}

export const settlementSteps = [
  { label: '解锁', title: '开启一次记账', description: '外围合约调用 unlock，PoolManager 进入 unlockCallback，三种币的净额从零开始。' },
  { label: '第一跳', title: '用 USDC 换 WETH', description: '这一步记下欠池子 100 USDC，并有权领取 0.05 WETH。' },
  { label: '第二跳', title: '用 WETH 换 DAI', description: '第二跳用掉刚收到的 WETH 额度，两笔 WETH 变化抵消。现在应付 USDC，应收 DAI。' },
  { label: '结算', title: '清掉剩余余额', description: '支付 100 USDC，领取 99 DAI。全部净额归零后，回调返回，交易完成。' },
] as const

export function settlementAt(step: number, skipPayment: boolean) {
  if (step <= 0) return { deltas: [0, 0, 0], status: 'open' } as const
  if (step === 1) return { deltas: [-100, 0.05, 0], status: 'open' } as const
  if (step === 2) return { deltas: [-100, 0, 99], status: 'open' } as const
  return skipPayment
    ? { deltas: [-100, 0, 0], status: 'reverted' } as const
    : { deltas: [0, 0, 0], status: 'settled' } as const
}
