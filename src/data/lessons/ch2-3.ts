import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '2-3',
  chapterId: 2,
  order: 3,
  title: '虚拟储备',
  summary: '理解如何将流动性 L 映射回实际的 token0/token1 储备量，掌握区间内/外的三种情况。',
  content: `# 虚拟储备

有了流动性 $L$ 和区间 $[P_a, P_b]$，我们需要回答：**当前价格 $P_c$ 下，LP 的仓位实际持有多少 token0 和 token1？** 这就是"虚拟储备"映射。

## 三种情况

设 $\\sqrt{P_a} < \\sqrt{P_b}$，当前价 $\\sqrt{P_c}$。根据 $P_c$ 相对区间的位置，分三种情况：

### 情况一：$P_c \\le P_a$（当前价低于区间下限）

此时价格在区间之下，仓位"全是 token0"——因为若价格从下方进入区间，需要用 token0 换出 token1：

$$
x = L \\cdot \\left( \\frac{1}{\\sqrt{P_a}} - \\frac{1}{\\sqrt{P_b}} \\right), \\quad y = 0
$$

### 情况二：$P_a < P_c < P_b$（当前价在区间内）

仓位同时持有两种代币，比例随价格移动而变化：

$$
x = L \\cdot \\left( \\frac{1}{\\sqrt{P_c}} - \\frac{1}{\\sqrt{P_b}} \\right), \\quad
y = L \\cdot \\left( \\sqrt{P_c} - \\sqrt{P_a} \\right)
$$

价格上升 → $y$ 增 $x$ 减（token0 被买入）；价格下降 → $x$ 增 $y$ 减。

### 情况三：$P_c \\ge P_b$（当前价高于区间上限）

价格在区间之上，仓位"全是 token1"：

$$
x = 0, \\quad y = L \\cdot \\left( \\sqrt{P_b} - \\sqrt{P_a} \\right)
$$

:::tip
记忆诀窍：当前价在哪一侧，仓位就全是"会被用来换走"的那个代币。价格低于区间 → 全 token0（等着被买走）；高于区间 → 全 token1。
:::

## 与合约的对应

合约里用 $\\sqrt{P}$ 的 Q64.96 定点表示 \`sqrtPriceX96\`，上述公式对应 \`SqrtPriceMath.getAmount0Delta\` / \`getAmount1Delta\`。我们用 \`getAmountsForLiquidity(tickLower, tickUpper, L)\` 一次性算出 \`{ amount0, amount1 }\`，它内部就是按上面三种分支实现的。

:::visual{type="liquidity-chart"}
:::

## 小结

- 当前价低于区间 → 全 token0；
- 当前价在区间内 → 两者都有，随价格移动此消彼长；
- 当前价高于区间 → 全 token1。

下一关我们用具体数字对比 V2 与 V3 的资本效率。
`,
  sandbox: {
    template: `// 给定区间和流动性 L，计算当前持有的 amount0 / amount1
// 可用全局函数 getAmountsForLiquidity(tickLower, tickUpper, L) -> { amount0, amount1 }
function solve(tickLower = -600, tickUpper = 600, L = 1000000000000000000n) {
  // TODO: 调用 getAmountsForLiquidity，返回 { amount0, amount1 }

  return { amount0: 0n, amount1: 0n }
}`,
    entryFunction: 'solve',
    hints: [
      '直接 return getAmountsForLiquidity(tickLower, tickUpper, L)',
      '当前价默认为 1.0（tick 0），在区间 [-600, 600] 内，故 amount0 和 amount1 都应 > 0',
    ],
    validator: 'exact',
    validatorKey: 'ch2-3-amounts',
  },
  quiz: [
    {
      type: 'choice',
      question: '当当前价格低于 LP 的区间下限 Pa 时，仓位的 token 组成是？',
      options: ['全是 token1', '全是 token0', '一半 token0 一半 token1', '为空'],
      answer: 1,
      explanation: '价格低于区间时，仓位全是 token0，等待被买入换出 token1。',
    },
    {
      type: 'choice',
      question: '当当前价格在区间 [Pa, Pb] 内，且价格上升时，仓位会发生什么？',
      options: [
        'token0 增加，token1 减少',
        'token0 减少，token1 增加',
        '两者都不变',
        '两者都增加',
      ],
      answer: 1,
      explanation: '价格上升 = token0 被买入，所以 token0 减少、token1 增加。',
    },
  ],
  visuals: ['liquidity-chart'],
}
