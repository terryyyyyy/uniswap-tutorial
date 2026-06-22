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
}

export function getValidator(key: string): (output: unknown) => boolean {
  return validators[key] ?? ((_output: unknown) => false)
}
