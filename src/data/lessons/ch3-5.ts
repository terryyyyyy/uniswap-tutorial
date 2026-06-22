import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '3-5',
  chapterId: 3,
  order: 5,
  title: 'Tick 数学实战',
  summary: '综合练习：给定价位和费率，计算完整的 tick 参数，巩固前 4 关知识。',
  content: `# Tick 数学实战

本关综合运用前 4 关：价格↔tick 转换、tickSpacing、liquidityNet、位图遍历。我们走一个完整的"建仓"计算流程。

## 场景

LP 想在 0.3% 费率档的 WETH/USDC 池中，于价格区间 $[1500, 2000]$（USDC per WETH）提供流动性，当前价 1800。

## 步骤 1：价格 → tick

$$
\\text{tick} = \\lfloor \\log_{1.0001}(P) \\rfloor
$$

- $P=1500$: tick ≈ 74587（$\\log_{1.0001} 1500 \\approx 74587$）
- $P=1800$: tick ≈ 78911
- $P=2000$: tick ≈ 79832

## 步骤 2：对齐到 tickSpacing

0.3% 档 tickSpacing=60。把 tickLower、tickUpper 对齐到 60 的倍数（向下取整）：

- tickLower = $\\lfloor 74587 / 60 \\rfloor \\times 60 = 74580$
- tickUpper = $\\lfloor 79832 / 60 \\rfloor \\times 60 = 79800$

## 步骤 3：判断当前价位置

当前 tick ≈ 78911，落在 $[74580, 79800]$ 区间内，故 LP 仓位同时持有 WETH 和 USDC（情况二）。

## 步骤 4：流动性 net 更新

该仓位注入流动性 $L$，则：

- \`liquidityNet[74580] += L\`（下界注入）
- \`liquidityNet[79800] -= L\`（上界抽走）
- \`liquidityGross[74580] += L\`，\`liquidityGross[79800] += L\`（两个边界 gross 都增）

## 步骤 5：位图置位

\`flipInitialized\` 把 tick 74580 和 79800 在位图中对应的 bit 置 1。

:::tip
这一整套计算，在合约里发生在 \`UniswapV3Pool._modifyPosition\` → \`Tick.update\`，LP 调用 \`mint\` 时自动完成。理解它，才能读懂 swap 为何能正确跨过这些边界。
:::

## 小结

完整建仓流程：价格→tick→对齐 spacing→更新 net/gross→位图置位。这 5 步是 V3 流动性管理的骨架。

第 3 章结束。下一章讲基于 tick 的 **Position 仓位管理**。
`,
  sandbox: {
    template: `// 综合：给定价格 P 和 tickSpacing，返回对齐后的 tick（向下取到 spacing 倍数）
function solve(P = 1500, tickSpacing = 60) {
  // TODO: 1) 用 priceToTick(P) 得到原始 tick
  //       2) 向下对齐到 tickSpacing 的倍数
  //       返回对齐后的 tick

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      'raw = priceToTick(P)',
      'aligned = Math.floor(raw / tickSpacing) * tickSpacing',
    ],
    validator: 'exact',
    validatorKey: 'ch3-5-aligned',
  },
  quiz: [
    {
      type: 'choice',
      question: '在 0.3% 费率档（tickSpacing=60），价格 P=1500 对应的原始 tick 约 74587，对齐后的可用 tick 是？',
      options: ['74580', '74587', '74600', '74640'],
      answer: 0,
      explanation: '$\\lfloor 74587/60 \\rfloor \\times 60 = 74580$。',
    },
    {
      type: 'choice',
      question: '一个仓位 [tickLower, tickUpper] 注入 L 后，对 liquidityGross 的影响是？',
      options: [
        '只有 tickLower 的 gross += L',
        '只有 tickUpper 的 gross += L',
        'tickLower 和 tickUpper 的 gross 都 += L',
        'gross 不变',
      ],
      answer: 2,
      explanation: 'gross 统计覆盖该 tick 的所有仓位，该仓位同时覆盖下界和上界，故两者都 += L。',
    },
  ],
  visuals: ['tick-axis'],
}
