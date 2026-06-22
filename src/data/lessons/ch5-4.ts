import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '5-4',
  chapterId: 5,
  order: 4,
  title: 'Swap 源码解析',
  summary: '逐行解读 UniswapV3Pool.swap 函数，理解状态更新顺序与核心逻辑。',
  content: `# Swap 源码解析

本关逐段拆解 \`UniswapV3Pool.swap\` 函数，理解每个状态变量的更新时机与顺序。这是 V3 最核心也最复杂的函数。

## 函数签名

\`\`\`solidity
function swap(
    address recipient,
    bool zeroForOne,
    int256 amountSpecified,
    uint160 sqrtPriceLimitX96,
    bytes calldata data
) external returns (int256 amount0, int256 amount1)
\`\`\`

- \`zeroForOne\`：方向（token0→token1 为 true）；
- \`amountSpecified\`：正=exactIn（指定输入），负=exactOut（指定输出）；
- \`sqrtPriceLimitX96\`：价格不能超限（保护滑点）。

## 状态变量

swap 用一个 \`SwapState\` 结构体记录中间状态：

- \`amountSpecifiedRemaining\`：剩余待处理量；
- \`amountCalculated\`：已计算的对方量；
- \`sqrtPriceX96\` / \`tick\` / \`feeGrowthGlobal\`：当前价格与累计；
- \`liquidity\`：活跃流动性。

## 主循环（简化）

\`\`\`
while (state.amountSpecifiedRemaining != 0 && state.liquidity > 0) {
    step.tickNext = nextInitializedTick(state.tick, zeroForOne);  // 下一个边界
    step.sqrtPriceStart = state.sqrtPriceX96;
    step.sqrtPriceNext = getSqrtRatioAtTick(step.tickNext);
    (step.amountIn, step.amountOut, step.feeAmount) = computeSwapStep(...);
    // 累加、更新价格
    if (state.sqrtPriceX96 == step.sqrtPriceNext) {
        // 到达边界 → cross
        if (step.tickNext != state.tick) {
            state.liquidity = zeroForOne ? state.liquidity - net : state.liquidity + net;
        }
        state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
    }
}
\`\`\`

## 关键细节

1. **价格先更新再判断 cross**：computeSwapStep 算出 sqrtPriceNext，若等于 target 则 cross；
2. **tick 调整**：zeroForOne 时 tick = tickNext - 1（因为价格刚跨过 tickNext 下方），反之 tick = tickNext；
3. **流动性方向**：zeroForOne（降价）cross 时 liquidity -= net（net 为下界注入的正值，降价离开其上方区间故减）；
4. **最后才转账**：swap 用 callback 模式，先算清账，再让调用方转代币（\`uniswapV3SwapCallback\`），核心合约不主动 transfer。

:::code-ref{id="pool-swap-source"}
:::

:::tip
"先算账后转账"是 V3 安全设计：合约在状态更新后才要求调用方付款，避免重入。Callback 里调用方必须 verify 签名（\`CallbackValidation\`）。
:::

## 小结

- swap 用 SwapState 跟踪中间状态，主循环分段；
- cross 时按方向调整 tick（∓1）和 liquidity（±net）；
- 先算账后转账（callback），保障安全。

下一关做 swap 综合实战。
`,
  sandbox: {
    template: `// 验证 swap 后的 tick 调整规则
// zeroForOne 时跨过 tickNext 后，当前 tick = tickNext - 1
function solve(tickNext = 100, zeroForOne = true) {
  // TODO: 返回 cross 后的当前 tick

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      'zeroForOne ? tickNext - 1 : tickNext',
    ],
    validator: 'exact',
    validatorKey: 'ch5-4-tick',
  },
  quiz: [
    {
      type: 'fill',
      question: 'zeroForOne 时跨过 tickNext 边界后，当前 tick 设为多少？（用 tickNext 表示）',
      answer: 'tickNext - 1',
      explanation: 'zeroForOne（降价）跨过 tickNext 后，价格在其下方，tick = tickNext - 1。',
    },
    {
      type: 'choice',
      question: 'V3 swap 采用"先算账后转账"的 callback 模式，主要目的是？',
      options: [
        '省 gas',
        '防重入攻击，合约在状态更新后才要求调用方付款',
        '支持多跳',
        '降低手续费',
      ],
      answer: 1,
      explanation: '先更新状态再 callback 转账，避免重入利用未完成状态。',
    },
  ],
  visuals: ['swap-animation'],
}
