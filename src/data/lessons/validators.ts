// code 题/沙盒校验函数集中表。每个 validator 接收 sandbox 输出，返回是否正确。
// Chunk 8 内容编写时按 lessonId 添加具体 validator。
export const validators: Record<string, (output: unknown) => boolean> = {
  // —— 第 1 章 AMM 基础 ——
  // 1-1 主沙盒：返回 AMM 瞬时价格（正数）
  'ch1-1-price': (output) => typeof output === 'number' && output > 0,
  // 1-2 主沙盒：返回 { price: number, k: bigint }
  'ch1-2-invariant': (output) =>
    typeof output === 'object' &&
    output !== null &&
    typeof (output as any).price === 'number' &&
    typeof (output as any).k === 'bigint',
  // 1-3 主沙盒：返回 ammSwap 结果（含 priceImpactBps）
  'ch1-3-swap': (output) =>
    typeof output === 'object' &&
    output !== null &&
    typeof (output as any).priceImpactBps === 'number',
  // 1-3 代码题：用户计算的价格影响必须 > 0
  'ch1-3-impact': (output) =>
    typeof output === 'object' &&
    output !== null &&
    Number((output as any).priceImpactBps) > 0,
  // 1-4 主沙盒：返回 V2/V3 手续费对比（v3Fee 为 bigint）
  'ch1-4-compare': (output) =>
    typeof output === 'object' &&
    output !== null &&
    typeof (output as any).v3Fee === 'bigint',

  // —— 第 2 章 集中流动性 ——
  'ch2-1-tick': (output) => typeof output === 'number',
  'ch2-2-L': (output) => typeof output === 'bigint' && output > 0n,
  'ch2-3-amounts': (output) =>
    typeof output === 'object' && output !== null &&
    typeof (output as any).amount0 !== 'undefined' &&
    typeof (output as any).amount1 !== 'undefined',
  'ch2-4-compare': (output) =>
    typeof output === 'object' && output !== null &&
    typeof (output as any).v2Fee === 'bigint' &&
    typeof (output as any).v3Fee === 'bigint',

  // —— 第 3 章 Tick 机制 ——
  'ch3-1-tick': (output) => typeof output === 'number',
  'ch3-2-spacing': (output) => typeof output === 'number' && output > 0,
  'ch3-3-net': (output) =>
    typeof output === 'object' && output !== null &&
    typeof (output as any).lowerNet === 'bigint' &&
    typeof (output as any).upperNet === 'bigint',
  'ch3-4-next': (output) => typeof output === 'number',
  'ch3-5-aligned': (output) => typeof output === 'number',

  // —— 第 4 章 仓位管理 ——
  'ch4-1-key': (output) => typeof output === 'string' && output.includes(':'),
  'ch4-2-L': (output) => typeof output === 'bigint' && output > 0n,
  'ch4-3-collect': (output) =>
    typeof output === 'object' && output !== null &&
    typeof (output as any).amount0 === 'bigint' &&
    typeof (output as any).amount1 === 'bigint',
  'ch4-4-nft': (output) => typeof output === 'string' && output.length > 0,
}

export function getValidator(key: string): (output: unknown) => boolean {
  return validators[key] ?? ((_output: unknown) => false)
}
