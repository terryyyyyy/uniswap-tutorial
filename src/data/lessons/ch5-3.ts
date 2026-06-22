import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '5-3',
  chapterId: 5,
  order: 3,
  title: '价格影响',
  summary: '理解大额 swap 如何导致价格大幅偏移，以及跨 tick 累积的价格影响。',
  content: `# 价格影响

swap 不是"按当前价无限成交"——你换得越多，价格移动越大。这就是**价格影响（price impact）**，是 AMM 的核心机制之一。

## 价格影响的来源

在恒定乘积/集中流动性下，任何 swap 都会移动价格：

$$
\\text{priceImpact} = \\frac{|P_{\\text{after}} - P_{\\text{before}}|}{P_{\\text{before}}}
$$

- 小额 swap：价格微动，影响小；
- 大额 swap：价格大幅移动，影响大；
- 流动性越深（$L$ 越大），同等金额的影响越小。

## 跨 tick 的累积

V3 中大额 swap 会跨越多个 tick。每跨一个边界，$L$ 跳变——若进入流动性更稀薄的区间，价格加速移动。所以 V3 的价格影响曲线不是平滑的，而是**分段**的，在每个 tick 边界处斜率变化。

:::tip
这也解释了为什么 LP 集中流动性到活跃区间能让滑点更低：活跃带 $L$ 大，小额 swap 价格几乎不动；但一旦 swap 大到走出活跃带，进入稀薄区，价格会迅速恶化。
:::

## priceImpactBps

我们的模拟器在 swap 返回 \`priceImpactBps\`（基点），用 swap 前后的 $\\sqrt{P}$ 计算：

$$
\\text{priceImpactBps} = \\frac{|\\sqrt{P}_{\\text{end}} - \\sqrt{P}_{\\text{start}}|}{\\sqrt{P}_{\\text{start}}} \\times 10000
$$

:::visual{type="swap-animation"}
:::

## 小结

- swap 越大、流动性越浅，价格影响越大；
- V3 价格影响曲线分段（tick 边界处 $L$ 跳变）；
- 集中流动性让活跃带滑点低，但区间外恶化快。

下一关逐行解析 swap 源码。
`,
  sandbox: {
    template: `// 对比小额与大额 swap 的价格影响
function solve() {
  // TODO: 创建池并 mint 流动性后，分别 swap 小额(1000n)和大额(500000n)，返回两者的 priceImpactBps
  // 可用 createPool, initialize, mint, swap
  // 返回 { smallImpact: number, largeImpact: number }

  return { smallImpact: 0, largeImpact: 0 }
}`,
    entryFunction: 'solve',
    hints: [
      'const p = createPool("A","B",3000); p.initialize(2n**96n); p.mint("lp",-600,600,1000000n*10n**18n,1000000n*10n**18n)',
      'small = p.swap(1000n*10n**18n,true).priceImpactBps；注意 swap 会改变池状态，大额需新建池或在同池连续 swap',
    ],
    validator: 'exact',
    validatorKey: 'ch5-3-impact',
  },
  quiz: [
    {
      type: 'choice',
      question: '为什么 V3 的价格影响曲线是分段而非平滑的？',
      options: [
        '因为 gas 按段计费',
        '因为每个 tick 边界处活跃流动性 L 跳变，斜率变化',
        '因为价格是整数',
        '因为手续费分段收取',
      ],
      answer: 1,
      explanation: 'tick 边界处 L 跳变，导致价格-数量关系斜率变化，曲线分段。',
    },
    {
      type: 'choice',
      question: '如何降低 swap 的价格影响？',
      options: [
        '提高手续费',
        '增大池子活跃区间的流动性 L，或减小 swap 金额',
        '加快交易速度',
        '换一个费率档',
      ],
      answer: 1,
      explanation: '价格影响 ∝ swap金额 / L，增大 L 或减小金额可降低影响。',
    },
  ],
  visuals: ['swap-animation'],
}
