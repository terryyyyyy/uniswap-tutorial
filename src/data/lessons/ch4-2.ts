import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '4-2',
  chapterId: 4,
  order: 2,
  title: '添加流动性（mint）',
  summary: '理解 mint 流程：从期望投入计算 L，更新 tick 与 position 状态，确定实际投入的代币数量。',
  content: `# 添加流动性（mint）

LP 调用 \`mint\` 向某区间注入流动性。流程涉及把"期望投入的代币数量"转换为流动性 $L$，再更新 tick 和 position 状态。

## mint 流程

1. **校验区间**：tickLower < tickUpper，且都是 tickSpacing 的整数倍；
2. **计算 L**：根据当前价相对区间的位置，用 \`getLiquidityForAmounts\`：
   - 若当前价在区间内：$L = \\min(L_0, L_1)$，其中 $L_0$ 由 amount0 决定、$L_1$ 由 amount1 决定。取 min 保证两种代币按比例配齐，不会超额投入；
   - 若当前价 < 区间：只投 token0，$L = L_0$；
   - 若当前价 > 区间：只投 token1，$L = L_1$。
3. **更新 tick**：对 tickLower（下界，net += L、gross += L）和 tickUpper（上界，net -= L、gross += L）调用 \`Tick.update\`；
4. **更新活跃流动性**：若区间包含当前 tick，\`pool.liquidity += L\`；
5. **更新 position**：\`Position.update\` 累加 L，记录当前 feeGrowthInside 快照；
6. **计算实际投入量**：用 \`getAmountsForLiquidity\` 由 L 反算实际需要的 amount0、amount1（可能小于期望值，因为取了 min）。

:::code-ref{id="pool-mint"}
:::

## 取 min 的含义

当当前价在区间内，LP 报价 "想投 amount0 和 amount1"。但这两者未必等比例——比如 amount0 偏多。合约取 $L = \\min(L_0, L_1)$，即**按较少的一方决定 L**，多出的那部分代币不投入（退回给 LP）。这保证投入严格按当前价比例配齐。

## 例

当前价 1.0，区间 $[0.9, 1.1]$，LP 想投 100 token0 + 100 token1。若按比例只需 90 token0 + 110 token1 即可凑出某 $L$，则合约实际投入 90+110，退回 10 token0。

:::tip
实际开发中 LP 通常用 \`NonfungiblePositionManager.mint\`，它会处理转账、滑点保护、回调。核心数学在 \`UniswapV3Pool.mint\` → \`_modifyPosition\`。
:::

:::visual{type="position-range"}
:::

## 小结

- mint：期望投入 → L（取 min 配齐）→ 更新 tick/position/活跃 L → 反算实际投入；
- 区间内取 $\\min(L_0, L_1)$ 保证按比例配齐，多出退回；
- 若当前价在区间外，只投单一代币。

下一关讲移除流动性（burn + collect）。
`,
  sandbox: {
    template: `// 模拟 mint：给定区间和投入量，计算流动性 L
// 可用全局 getLiquidityForAmounts(tickLower, tickUpper, amount0, amount1) -> bigint
function solve(tickLower = -600, tickUpper = 600, amount0 = 1000000n, amount1 = 1000000n) {
  // TODO: 返回 L

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      '直接 return getLiquidityForAmounts(tickLower, tickUpper, amount0, amount1)',
      '当前价默认 1.0，在区间内，会取 min 配齐',
    ],
    validator: 'exact',
    validatorKey: 'ch4-2-L',
  },
  quiz: [
    {
      type: 'choice',
      question: 'mint 时若当前价在区间内，流动性 L 如何确定？',
      options: [
        'L = amount0 + amount1',
        'L = max(L0, L1)，按较多的一方',
        'L = min(L0, L1)，按较少的一方配齐',
        'L = amount0 * amount1',
      ],
      answer: 2,
      explanation: '取 min 保证两种代币按当前价比例配齐，多出部分退回。',
    },
    {
      type: 'choice',
      question: 'mint 后若区间包含当前 tick，活跃流动性如何变化？',
      options: [
        '不变',
        'pool.liquidity += L',
        'pool.liquidity -= L',
        '重置为 L',
      ],
      answer: 1,
      explanation: '区间含当前价时该仓位在做市，故活跃 L += L。',
    },
  ],
  visuals: ['position-range'],
}
