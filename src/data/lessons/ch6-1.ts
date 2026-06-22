import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '6-1',
  chapterId: 6,
  order: 1,
  title: '手续费率',
  summary: '理解 V3 的四个费率档与 tickSpacing 映射，以及选费率档的策略。',
  content: `# 手续费率

V3 每个池子有固定的费率档（feeTier），决定每笔 swap 抽取多少手续费分给 LP。

## 四个费率档

| fee | 费率 | tickSpacing | 适用场景 |
|---|---|---|---|
| 100 | 0.01% | 1 | 极稳定对（同质资产） |
| 500 | 0.05% | 10 | 稳定币对 |
| 3000 | 0.3% | 60 | 主流资产对（ETH/USDC 等） |
| 10000 | 1% | 200 | 长尾/高波动资产 |

手续费从**输入代币**中扣除。例如 0.3% 档，输入 1000 USDC 换 ETH，先扣 3 USDC 手续费给 LP，剩 997 USDC 参与定价换 ETH。

:::tip
费率与 tickSpacing 同量级匹配：高波动资产用高费率（补偿 LP 风险）+ 粗 tickSpacing（无需精细）；稳定币用低费率 + 细 tickSpacing。这让套利博弈自然均衡——价差小于费率时无套利空间。
:::

## 选费率档的策略

LP 选费率档的核心是"预期波动 vs 风险补偿"：

- **低费率档**：适合窄波动资产（稳定币），LP 风险低、交易频繁，靠量取胜；
- **高费率档**：适合高波动资产，LP 承担更大无常损失风险，需更高单笔补偿。

同一交易对可有多个费率档池并存（如 USDC/USDT 同时有 0.01% 和 0.05% 池），流动性会自然流向更优的档。

:::visual{type="fee-growth-chart"}
:::

## 小结

- 4 档：0.01%/0.05%/0.3%/1%，对应 tickSpacing 1/10/60/200；
- 手续费从输入扣除，全部分给 LP（无协议费时）；
- 选档：低波动用低费率，高波动用高费率。

下一关讲手续费如何按流动性占比精确分配——feeGrowth 机制。
`,
  sandbox: {
    template: `// 给定 swap 输入量和费率，计算 LP 收取的手续费
function solve(amountIn = 1000n, feePips = 3000) {
  // TODO: fee = amountIn * feePips / 1_000_000

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      'return (amountIn * BigInt(feePips)) / 1000000n',
      '3000 pips = 0.3%，1000 输入收 3 手续费',
    ],
    validator: 'exact',
    validatorKey: 'ch6-1-fee',
  },
  quiz: [
    {
      type: 'choice',
      question: '0.3% 费率档（fee=3000）中，输入 1000 代币，LP 收取多少手续费？',
      options: ['0.3', '3', '30', '300'],
      answer: 1,
      explanation: '1000 × 0.3% = 3，手续费从输入扣除给 LP。',
    },
    {
      type: 'choice',
      question: '稳定币对（如 USDC/USDT）通常选哪个费率档？',
      options: ['0.01% 或 0.05%（低费率）', '0.3%', '1%', '任意都行'],
      answer: 0,
      explanation: '稳定币波动极小，用低费率档匹配，靠高频交易获利。',
    },
  ],
  visuals: ['fee-growth-chart'],
}
