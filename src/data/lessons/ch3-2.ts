import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '3-2',
  chapterId: 3,
  order: 2,
  title: 'Tick Spacing',
  summary: '理解 feeTier 与 tickSpacing 的映射，以及为什么需要 tick 间距。',
  content: `# Tick Spacing

理论上每个 tick（0.01%）都可以作为仓位边界，但这会让 swap 跨越大量 tick、合约遍历成本爆炸。V3 引入 **tickSpacing**：只有 tickSpacing 的整数倍 tick 才能被"初始化"用作仓位边界。

## feeTier 与 tickSpacing 的映射

V3 每个费率档（feeTier）对应一个 tickSpacing：

| fee（hundredths of a bip） | 费率 | tickSpacing |
|---|---|---|
| 100 | 0.01% | 1 |
| 500 | 0.05% | 10 |
| 3000 | 0.3% | 60 |
| 10000 | 1% | 200 |

:::tip
规律：**费率越高，tickSpacing 越大**。高费率档面向波动大的资产（价格跳跃大），无需细粒度 tick；低费率档面向稳定币（价格微动），需要精细 tick。两者匹配，避免无谓的 tick 遍历开销。
:::

## "可用 tick" 的含义

以 0.3% 费率档（tickSpacing=60）为例，只有 tick = ..., -120, -60, 0, 60, 120, ... 才能作为仓位边界。如果你想把仓位设在 tick=10，合约会取最近的可用 tick。

每个 tickSpacing 单位对应的价格变化：$1.0001^{60} \\approx 1.006$，即约 0.6% 的价格步进。这与 0.3% 的费率大致同量级——**保证一次 tick 内的价格移动产生的价差，和手续费相当**，避免套利者无利可图地频繁触发跨 tick。

## 为什么这么设计

1. **控制 gas**：swap 跨越的 tick 数 = 价格移动 / tickSpacing，间距大则遍历少；
2. **匹配费率**：tickSpacing 与费率同量级，让套利博弈自然均衡；
3. **覆盖需求**：稳定币对用 0.01%/0.05% 档（细 tick），主流资产用 0.3%，长尾/剧烈波动用 1%。

## 多池共存

注意：**同一交易对在不同费率下是不同的池子**。USDC/USDC 可能有 0.01% 和 0.05% 两个池，各自有独立的 tickSpacing 和流动性。LP 按预期波动选择费率档。

:::visual{type="tick-axis"}
:::

## 小结

- tickSpacing 限制只有其整数倍的 tick 可作仓位边界；
- feeTier → tickSpacing：100→1, 500→10, 3000→60, 10000→200；
- 费率与间距同量级，控制 gas 并匹配套利均衡。

下一关深入 tick 的状态结构。
`,
  sandbox: {
    template: `// 给定费率档，返回对应的 tickSpacing
function solve(fee = 3000) {
  // TODO: fee 100 -> 1, 500 -> 10, 3000 -> 60, 10000 -> 200
  // 可用一个对象映射或 switch

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      '用 { 100:1, 500:10, 3000:60, 10000:200 } 查表',
      '注意 3000 费率对应 tickSpacing 60',
    ],
    validator: 'exact',
    validatorKey: 'ch3-2-spacing',
  },
  quiz: [
    {
      type: 'choice',
      question: '0.3% 费率档（fee=3000）对应的 tickSpacing 是多少？',
      options: ['1', '10', '60', '200'],
      answer: 2,
      explanation: 'fee 3000 → tickSpacing 60，对应约 0.6% 的价格步进。',
    },
    {
      type: 'choice',
      question: '为什么费率越高，tickSpacing 越大？',
      options: [
        '高费率资产价格波动大，无需细粒度 tick，且能减少 swap 时的 tick 遍历开销',
        '高费率档不允许设置 tick',
        '高费率档的流动性自动减半',
        '高费率档必须用整数价格',
      ],
      answer: 0,
      explanation: '高费率面向波动大的资产，粗粒度 tick 足够，且减少跨 tick 遍历的 gas 成本。',
    },
  ],
  visuals: ['tick-axis'],
}
