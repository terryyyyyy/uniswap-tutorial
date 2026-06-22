import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '5-1',
  chapterId: 5,
  order: 1,
  title: '单 Tick 内 Swap',
  summary: '理解在单个 tick 区间内的 swap 计算，掌握 computeSwapStep 的核心逻辑。',
  content: `# 单 Tick 内 Swap

swap 的核心计算单元是 \`computeSwapStep\`：在**活跃流动性 $L$ 恒定**的单个 tick 区间内，给定输入/输出量，算出价格移动到哪里、换出多少代币。本关聚焦"不跨 tick"的情况。

## 输入与输出

\`computeSwapStep(sqrtCurrent, sqrtTarget, liquidity, amountRemaining, feePips)\` 返回：

- \`sqrtPriceNext\`：本次 step 后的价格（不超过 sqrtTarget）；
- \`amountIn\` / \`amountOut\`：本次交换的进出量；
- \`feeAmount\`：手续费。

## 数学核心

在一个 tick 区间内 $L$ 恒定，价格从 $\\sqrt{P_c}$ 移向 $\\sqrt{P_t}$（target）。两种代币的变化量：

- token0 变化 $\\Delta x = L \\cdot (1/\\sqrt{P_1} - 1/\\sqrt{P_2})$；
- token1 变化 $\\Delta y = L \\cdot (\\sqrt{P_2} - \\sqrt{P_1})$。

方向 \`zeroForOne\`（token0 → token1）时价格下降（$\\sqrt{P}$ 减），反之上升。

## exactIn 流程

1. 预扣手续费：\`amountLessFee = amountRemaining * (1e6 - feePips) / 1e6\`；
2. 算"若到达 target 所需的 amountIn"（\`getAmount0Delta\` 或 \`getAmount1Delta\`）；
3. 若 \`amountLessFee >= 所需\`，价格到达 target（本次 step 结束于此 tick 边界）；否则用 \`getNextSqrtPriceFromInput\` 算实际到达的价格；
4. 用实际价格算 amountIn/amountOut；
5. 若未达 target，fee = 剩余输入 - amountIn（多余全作手续费）。

:::tip
关键直觉：单 tick 内 $L$ 不变，所以价格-数量的关系是确定的连续函数。computeSwapStep 就是"在 $L$ 恒定下，把剩余金额消耗到价格移动上"的求解器。
:::

:::code-ref{id="compute-swap-step"}
:::

## 小结

- 单 tick 内 $L$ 恒定，用 \`computeSwapStep\` 算价格移动与进出量；
- exactIn 先扣费，再判断能否到 target；
- 未达 target 时多余输入全作手续费。

下一关讲价格跨越多个 tick 边界的情况。
`,
  sandbox: {
    template: `// 用 computeSwapStep 模拟单 tick 内的 swap
// 可用全局 computeSwapStep(sqrtCurrent, sqrtTarget, liquidity, amountRemaining, feePips)
// 返回 { sqrtPriceNextX96, amountIn, amountOut, feeAmount }
function solve(liquidity = 1000000000000000000n, amountIn = 1000n) {
  // TODO: 调用 computeSwapStep，当前价 Q96，目标价略低
  // sqrtCurrent = 2n**96n, sqrtTarget = 2n**96n - 1000n, feePips = 3000
  // 返回结果对象

  return null
}`,
    entryFunction: 'solve',
    hints: [
      'const Q = 2n**96n; return computeSwapStep(Q, Q - 1000n, liquidity, amountIn, 3000)',
      'zeroForOne = sqrtCurrent >= sqrtTarget，这里 Q >= Q-1000 成立',
    ],
    validator: 'exact',
    validatorKey: 'ch5-1-step',
  },
  quiz: [
    {
      type: 'fill',
      question: '在单个 tick 区间内，活跃流动性 L 是否恒定？（填"恒定"或"变化"）',
      answer: '恒定',
      explanation: '单 tick 区间内 L 恒定，只在跨 tick 边界时跳变。',
    },
    {
      type: 'choice',
      question: 'computeSwapStep 在 exactIn 且未到达 target 时，多余的输入怎么处理？',
      options: [
        '退回给用户',
        '全部作为手续费',
        '累积到下一 step',
        '销毁',
      ],
      answer: 1,
      explanation: '未达 target 时 fee = amountRemaining - amountIn，多余输入全作手续费。',
    },
  ],
  visuals: ['swap-animation'],
}
