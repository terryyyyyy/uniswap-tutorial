import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '6-3',
  chapterId: 6,
  order: 3,
  title: 'LP 手续费分配',
  summary: '理解多 LP 按流动性占比分配手续费，以及 tokensOwed 的惰性累计。',
  content: `# LP 手续费分配

有了 feeGrowthInside，每个 LP 的应得手续费就是简单的增量计算：

$$
\\text{tokensOwed} += (\\text{feeGrowthInside}_\\text{now} - \\text{feeGrowthInside}_\\text{last}) \\times L_{\\text{position}} / 2^{128}
$$

## 按流动性占比的体现

- LP 的 $L$ 越大，相同 feeGrowthInside 增量下分得越多——这就是"按流动性占比"；
- 只在 LP 的区间内（价格在其区间时）feeGrowthInside 才增长，区间外不变——保证只分在场时的手续费；
- 结算后更新 last 快照，下次只算新增量。

## 惰性结算

合约**不实时**转账给 LP，而是把应得累加到 \`tokensOwed\`。只有 LP 调 \`collect\` 时才一次性转出。这极大省 gas——上千笔 swap 不需逐笔转账。

:::tip
多 LP 的分配天然由"各自的 $L$ × 区间内 feeGrowth 增量"实现，无需中心化计算。两个 LP 同区间、$L$ 比 3:2，则手续费也按 3:2 分（因为 feeGrowthInside 相同，$L$ 决定份额）。
:::

## 示例

LP-Alice $L=3$，LP-Bob $L=2$，同区间。区间内 feeGrowth 增量 $\\Delta = 1000$（Q128）：

- Alice 得 $1000 \\times 3 / 2^{128}$；
- Bob 得 $1000 \\times 2 / 2^{128}$；
- 合计 $1000 \\times 5 / 2^{128}$ = 该区间本次总手续费。

:::visual{type="lp-pie-chart"}
:::

## 小结

- tokensOwed += (inside_now - inside_last) × L / 2^128，按 $L$ 占比分配；
- 只在区间内累计，区间外不赚；
- 惰性结算，collect 时才转出，省 gas。

下一关解析手续费相关源码。
`,
  sandbox: {
    template: `// 多 LP 按流动性占比分配手续费
// 可用全局 calculateLPShare(totalFee, lps) -> bigint[]
// lps 是 [{ liquidity }, ...]
function solve(totalFee = 1000n) {
  // TODO: 两个 LP，liquidity 分别 3 和 2，返回各自分得

  return [0n, 0n]
}`,
    entryFunction: 'solve',
    hints: [
      'return calculateLPShare(totalFee, [{ liquidity: 3n }, { liquidity: 2n }])',
      '3:2 分配，1000 分成 600 和 400',
    ],
    validator: 'exact',
    validatorKey: 'ch6-3-share',
  },
  quiz: [
    {
      type: 'choice',
      question: '两个 LP 同区间、流动性比 3:2，手续费如何分配？',
      options: ['平均分', '按 3:2 分', '按 2:3 分', '先到先得'],
      answer: 1,
      explanation: 'feeGrowthInside 相同，$L$ 决定份额，故按 3:2。',
    },
    {
      type: 'choice',
      question: 'LP 何时实际收到手续费代币？',
      options: [
        '每笔 swap 后立即到账',
        '调用 collect 时一次性转出累计的 tokensOwed',
        '每天结算一次',
        '关闭仓位时',
      ],
      answer: 1,
      explanation: '惰性结算：tokensOwed 累计，collect 时才转账，省 gas。',
    },
  ],
  visuals: ['lp-pie-chart'],
}
