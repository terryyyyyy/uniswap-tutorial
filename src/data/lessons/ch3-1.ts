import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '3-1',
  chapterId: 3,
  order: 1,
  title: 'Tick 概念',
  summary: '理解 tick 作为价格的离散化表示，掌握 price = 1.0001^tick 的对数空间映射。',
  content: `# Tick 概念

集中流动性让 LP 选择任意价格区间 $[P_a, P_b]$。但合约不能存储"连续"的价格——那样有无穷多个点。V3 的做法是把价格轴**离散化**成一个个网格点，每个点叫一个 **tick**。

## 价格与 tick 的映射

V3 定义：

$$
P(\\text{tick}) = 1.0001^{\\text{tick}}
$$

- tick = 0 → 价格 1.0
- tick = 1 → 价格 1.0001（涨 0.01%）
- tick = -1 → 价格 0.9999（跌 0.01%）
- tick = 10000 → 价格约 2.718（$e$）

相邻 tick 之间价格相差 **0.01%（1 个基点）**。这是一种**对数空间**的等距划分：无论价格高低，每个 tick 代表相同的相对变化（0.01%），而非绝对变化。

:::tip
为什么是 1.0001？因为它让 $\\log_{1.0001}(P)$ 在数值上接近"基点数"——价格翻倍约需 6931 个 tick。对数等距意味着低价格区和高价格区的 tick 密度一样"合理"。
:::

## tick 的范围

V3 的 tick 范围是 $[-887272, 887272]$，对应价格约 $[1.0001^{-887272}, 1.0001^{887272}]$，即极宽的 $[\\approx 2^{-128}, \\approx 2^{128}]$，足以覆盖任何现实资产对。

## 为什么用 tick 而非连续价格

1. **可枚举**：合约能遍历有限的 tick 边界，实现跨 tick swap（下一章）；
2. **存储高效**：每个 tick 只需记录经过它的流动性净变化（\`liquidityNet\`），用位图标记哪些 tick 已初始化；
3. **精度可控**：0.01% 的粒度对绝大多数资产足够，又不会让 tick 数量爆炸。

:::visual{type="tick-axis"}
:::

## sqrtPriceX96

合约内部不直接存 price，而存 $\\sqrt{P}$ 的 Q64.96 定点数 \`sqrtPriceX96\`：

$$
\\text{sqrtPriceX96} = \\sqrt{P} \\cdot 2^{96}
$$

用 $\\sqrt{P}$ 而非 $P$，是因为 swap 计算中大量出现 $\\sqrt{P}$（见 $L$ 公式），直接存它省去开方。tick 与 sqrtPriceX96 可互转（\`TickMath.getSqrtRatioAtTick\`）。

## 小结

- tick 是价格的离散化网格，$P = 1.0001^{\\text{tick}}$，相邻 tick 差 0.01%；
- tick 范围 $[-887272, 887272]$，覆盖极宽价格；
- 合约存 \`sqrtPriceX96 = √P · 2^96\`，与 tick 可互转。

下一关讲 tick 如何按费率分组——tickSpacing。
`,
  sandbox: {
    template: `// 练习 price 与 tick 的互转
// 可用全局：priceToTick(price) -> number, tickToPrice(tick) -> number
function solve(price = 1.0) {
  // TODO: 返回 price 对应的 tick（向下取整）

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      '价格 1.0 对应 tick 0',
      '直接 return priceToTick(price)',
    ],
    validator: 'exact',
    validatorKey: 'ch3-1-tick',
  },
  quiz: [
    {
      type: 'fill',
      question: 'tick = 0 时，价格 P = 1.0001^0 等于多少？',
      answer: '1',
      explanation: '$1.0001^0 = 1$，tick 0 对应价格 1.0。',
    },
    {
      type: 'fill',
      question: '相邻两个 tick 之间的价格相对变化是多少？（写百分数，不带%）',
      answer: '0.01',
      explanation: '$1.0001^1 / 1.0001^0 - 1 = 0.0001 = 0.01\\%$，相邻 tick 差 1 个基点。',
    },
  ],
  visuals: ['tick-axis'],
}
