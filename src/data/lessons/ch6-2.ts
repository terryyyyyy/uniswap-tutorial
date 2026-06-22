import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '6-2',
  chapterId: 6,
  order: 2,
  title: 'feeGrowth 机制',
  summary: '理解 feeGrowthGlobal 与 feeGrowthOutside 的累计机制，以及 getFeeGrowthInside 的区间计算。',
  content: `# feeGrowth 机制

V3 要把每笔 swap 的手续费**按流动性占比**精确分配给"当前正在做市"的 LP。但 LP 众多、区间各异，逐笔分配不可行。V3 用**累计增量**机制高效实现。

## feeGrowthGlobal

全局累计量：

$$
\\text{feeGrowthGlobal}_X = \\sum \\frac{\\text{fee}_i}{L_{\\text{active},i}} \\quad (\\text{Q128 定点})
$$

每次 swap 产生手续费 fee、当时活跃流动性 $L_{\\text{active}}$，则 \`feeGrowthGlobal += fee * 2^128 / L_active\`。它记录"每单位流动性累计应得的手续费"。

## 问题：区间外不赚手续费

某 LP 区间 $[P_a, P_b]$，当价格在其区间外时，该 LP 不在做市，不应分得手续费。但 feeGrowthGlobal 包含了所有时段。需要"扣除该 LP 不在场的部分"。

## feeGrowthOutside 与 getFeeGrowthInside

每个 tick 存 \`feeGrowthOutside\`，记录"该 tick 之外"的累计。通过下界/上界的 outside 组合，可算出"区间内"的累计 \`feeGrowthInside\`：

$$
\\text{feeGrowthInside} = \\text{feeGrowthGlobal} - \\text{feeGrowthBelow} - \\text{feeGrowthAbove}
$$

其中 Below/Above 根据当前价相对 tick 的位置取 outside 或 (global - outside)。

:::tip
直觉：feeGrowthInside 是"当前价在区间内时累计的、每单位流动性应得手续费"。LP 用 (feeGrowthInside_now - feeGrowthInside_last) × L 即得增量手续费，无需逐笔记录。
:::

## cross 时翻转 outside

swap 跨过 tick 时，翻转该 tick 的 outside：\`outside = global - outside\`。这保证无论价格在哪侧，getFeeGrowthInside 都正确。

:::code-ref{id="tick-fee-growth"}
:::

## 小结

- feeGrowthGlobal 累计"每单位流动性应得手续费"；
- feeGrowthOutside + getFeeGrowthInside 算出区间内累计；
- cross 时翻转 outside，保证正确性；
- LP 用 (inside_now - inside_last) × L 得增量，惰性结算。

下一关讲多 LP 的手续费分配。
`,
  sandbox: {
    template: `// 模拟 feeGrowthGlobal 累计：给定当前累计、本次手续费、活跃流动性，返回新累计
// 可用全局 calculateFeeGrowth(fg, feeAmount, liquidity) -> bigint
function solve(fg = 0n, feeAmount = 1000n, liquidity = 1000000n) {
  // TODO: 返回新的 feeGrowthGlobal

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      'return calculateFeeGrowth(fg, feeAmount, liquidity)',
      '若 liquidity 为 0 则不变',
    ],
    validator: 'exact',
    validatorKey: 'ch6-2-growth',
  },
  quiz: [
    {
      type: 'choice',
      question: 'feeGrowthGlobal 记录的是什么？',
      options: [
        '总手续费',
        '每单位流动性的累计应得手续费',
        'LP 数量',
        'swap 次数',
      ],
      answer: 1,
      explanation: 'feeGrowthGlobal = Σ fee_i / L_active_i，每单位流动性累计应得。',
    },
    {
      type: 'choice',
      question: 'swap 跨过 tick 时，该 tick 的 feeGrowthOutside 如何变化？',
      options: [
        '不变',
        '置零',
        '翻转：outside = global - outside',
        '翻倍',
      ],
      answer: 2,
      explanation: 'cross 时翻转 outside，保证 getFeeGrowthInside 在任意价格侧都正确。',
    },
  ],
  visuals: ['fee-growth-chart'],
}
