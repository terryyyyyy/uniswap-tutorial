import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '5-2',
  chapterId: 5,
  order: 2,
  title: '跨 Tick Swap',
  summary: '理解 swap 如何跨越多个 tick 边界，每次 cross 时用 liquidityNet 调整活跃流动性。',
  content: `# 跨 Tick Swap

实际 swap 往往跨越多个 tick 边界。每个边界处活跃流动性 $L$ 会跳变（由 liquidityNet 决定）。swap 主循环分段处理。

## 主循环

\`\`\`
while (剩余金额 != 0 且 活跃L > 0):
    tickNext = nextInitializedTick(当前tick, 方向)
    sqrtTarget = getSqrtRatioAtTick(tickNext)
    step = computeSwapStep(当前sqrtPrice, sqrtTarget, 活跃L, 剩余金额, fee)
    累加 step.amountIn / amountOut / fee
    剩余金额 -= step.amountIn + step.fee  (exactIn)
    若 sqrtPrice 到达 sqrtTarget:
        活跃L += liquidityNet[tickNext]   # cross
        当前tick = tickNext ∓ 1
    更新 sqrtPrice = step.sqrtPriceNext
\`\`\`

## cross 的作用

跨过 tick $t$ 时：

- 价格上升（token0 被买入）穿过 $t$：进入 $t$ 上方的区间，那些"下界=$t$"的仓位开始做市，活跃 L += net$[t]$（net 为正）；
- 价格下降穿过 $t$：离开 $t$ 上方区间，活跃 L -= net$[t]$。

合约同时"翻转"该 tick 的 feeGrowthOutside（为手续费分配做准备，第 6 章）。

## 为什么分段

每个 tick 区间内 $L$ 不同，computeSwapStep 要求 $L$ 恒定。所以必须**按 tick 边界切分**，每段单独算，跨边界时更新 $L$ 再继续下一段。这样保证了 swap 在不同流动性密度下仍精确。

:::tip
直观理解：价格轴像一条由不同"宽度+深度"的管道串联而成。每段管道（tick 区间）有自己的 $L$，swap 是液体流过这些管道——流到接头（tick 边界）时管道变粗或变细（$L$ 跳变），继续流。
:::

:::code-ref{id="pool-swap"}
:::

:::visual{type="swap-animation"}
:::

## 小结

- swap 主循环按 tick 边界分段；
- 每段用 computeSwapStep（$L$ 恒定）；
- 跨 tick 时 cross：活跃 L += liquidityNet，并翻转 feeGrowthOutside。

下一关讲大额 swap 的价格影响。
`,
  sandbox: {
    template: `// 模拟跨 tick swap：创建池、添加流动性、执行大额 swap
// 可用全局 createPool(token0, token1, fee) -> PoolSimulator
// PoolSimulator 有 .initialize(sqrtPrice)、.mint(owner, tickLower, tickUpper, a0, a1)、.swap(amountSpecified, zeroForOne)
function solve() {
  // TODO: 1) createPool('A','B',100) tickSpacing=1 易跨 tick
  //       2) initialize(2n**96n)  价格=1
  //       3) mint('lp', -10, 10, 1000000n*10n**18n, 1000000n*10n**18n)
  //       4) swap(500000n*10n**18n, true) 返回结果

  return null
}`,
    entryFunction: 'solve',
    hints: [
      'const p = createPool("A","B",100); p.initialize(2n**96n); p.mint("lp",-10,10,1000000n*10n**18n,1000000n*10n**18n); return p.swap(500000n*10n**18n, true)',
      '返回结果含 tickCrossed 数组，记录跨过的 tick',
    ],
    validator: 'exact',
    validatorKey: 'ch5-2-cross',
  },
  quiz: [
    {
      type: 'choice',
      question: 'swap 主循环为什么按 tick 边界分段？',
      options: [
        '因为每个 tick 区间内 L 恒定，computeSwapStep 要求 L 不变',
        '因为 gas 计算按 tick 数收费',
        '因为 tick 边界必须暂停',
        '没有原因，只是惯例',
      ],
      answer: 0,
      explanation: '每个 tick 区间 L 不同，computeSwapStep 要求 L 恒定，故按边界切分。',
    },
    {
      type: 'choice',
      question: '跨过 tick 边界时，活跃流动性如何更新？',
      options: [
        '不变',
        '活跃 L += liquidityNet[tickNext]',
        '重置为 0',
        '减半',
      ],
      answer: 1,
      explanation: 'cross 时活跃 L += liquidityNet[tickNext]（net 可正可负）。',
    },
  ],
  visuals: ['swap-animation'],
}
