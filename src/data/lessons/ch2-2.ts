import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '2-2',
  chapterId: 2,
  order: 2,
  title: '流动性数量 L',
  summary: '推导流动性数量 L 的定义 L²=Δx·Δy，理解 L 与虚拟储备的关系。',
  content: `# 流动性数量 L

集中流动性需要一个量来度量"某区间内做市能力的大小"，这个量就是**流动性 $L$**。本关我们推导它的定义。

## 从恒定乘积说起

回顾 V2：储备 $R_x, R_y$ 满足 $R_x \\cdot R_y = k$，价格 $P = R_y / R_x$。可推出：

$$
R_x = \\sqrt{k / P}, \\quad R_y = \\sqrt{k \\cdot P}
$$

定义 **流动性 $L = \\sqrt{k}$**，则：

$$
R_x = L / \\sqrt{P}, \\quad R_y = L \\cdot \\sqrt{P}
$$

$L$ 越大，同样价格下储备越多，做市能力越强。

## 集中区间的 L

V3 中，LP 在区间 $[P_a, P_b]$ 内提供 $\\Delta x$ 的 token0 和 $\\Delta y$ 的 token1。由上式，区间两端满足：

$$
\\Delta x = L \\cdot \\left( \\frac{1}{\\sqrt{P_a}} - \\frac{1}{\\sqrt{P_b}} \\right), \\quad
\\Delta y = L \\cdot \\left( \\sqrt{P_b} - \\sqrt{P_a} \\right)
$$

把两式相乘：

$$
\\Delta x \\cdot \\Delta y = L^2 \\cdot \\left( \\frac{1}{\\sqrt{P_a}} - \\frac{1}{\\sqrt{P_b}} \\right) \\left( \\sqrt{P_b} - \\sqrt{P_a} \\right) = L^2 \\cdot \\frac{(\\sqrt{P_b} - \\sqrt{P_a})^2}{\\sqrt{P_a} \\cdot \\sqrt{P_b}} \\cdot \\frac{\\sqrt{P_b}}{\\sqrt{P_b}} = L^2
$$

化简后得到 V3 最核心的公式之一：

$$
\\boxed{L^2 = \\Delta x \\cdot \\Delta y} \\quad \\Rightarrow \\quad L = \\sqrt{\\Delta x \\cdot \\Delta y}
$$

:::tip
直觉：$L$ 衡量"区间内能吸收多大交易而不让价格剧烈变动"。$\\Delta x \\cdot \\Delta y$ 越大，$L$ 越大，池子越"深"。
:::

## L 与资本效率

对**相同的 $\\Delta x, \\Delta y$ 投入**，区间越窄（$P_a, P_b$ 越接近），$L$ 不变，但这个 $L$ 集中在更窄的价格带——等效于在该窄带内提供了远超 V2 的流动性密度。这就是资本效率的数学根源。

## 小结

- $L = \\sqrt{k}$，度量做市能力；
- 集中区间内 $L^2 = \\Delta x \\cdot \\Delta y$，即 $L = \\sqrt{\\Delta x \\cdot \\Delta y}$；
- 同样投入下区间越窄，流动性密度越高。

下一关我们把 $L$ 映射回实际的 token 储备量。
`,
  sandbox: {
    template: `// 给定区间 [tickLower, tickUpper] 和投入的 amount0, amount1，计算流动性 L
// 可用全局函数 getLiquidityForAmounts(tickLower, tickUpper, amount0, amount1) -> bigint
function solve(tickLower = -600, tickUpper = 600, amount0 = 1000000n, amount1 = 1000000n) {
  // TODO: 调用 getLiquidityForAmounts 返回 L（bigint）

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      '直接 return getLiquidityForAmounts(tickLower, tickUpper, amount0, amount1)',
      'tick ±600 对应价格约 [0.94, 1.06] 附近',
    ],
    validator: 'exact',
    validatorKey: 'ch2-2-L',
  },
  quiz: [
    {
      type: 'fill',
      question: '若 LP 在区间内投入 Δx = 100、Δy = 100，则流动性 L = √(Δx·Δy) 等于多少？',
      answer: '100',
      explanation: '$L = \\sqrt{100 \\cdot 100} = \\sqrt{10000} = 100$。',
    },
    {
      type: 'fill',
      question: '流动性 L 的定义是 L = √k，其中 k 是恒定乘积 R_x·R_y。若 k = 10000，L = ?',
      answer: '100',
      explanation: '$L = \\sqrt{k} = \\sqrt{10000} = 100$。',
    },
  ],
  visuals: ['liquidity-chart'],
}
