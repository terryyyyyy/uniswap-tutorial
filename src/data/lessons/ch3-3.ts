import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '3-3',
  chapterId: 3,
  order: 3,
  title: 'Tick 状态',
  summary: '理解每个 tick 存储的状态：liquidityNet、liquidityGross、feeGrowthOutside，以及更新规则。',
  content: `# Tick 状态

每个被用到的 tick（作为某仓位的下界或上界）在合约中存储一组状态，记录它对全局流动性和手续费的影响。核心字段有三个。

## liquidityGross（总流动性）

$$
\\text{liquidityGross}[t] = \\sum_{\\text{所有覆盖 } t \\text{ 的仓位}} L_i
$$

即所有"区间包含 tick $t$"的仓位的流动性之和。它用来判断 tick 是否"在用"（>0 则已初始化，位图置位）。当某 tick 的 gross 归零，它可被"回收"（位图清除）。

## liquidityNet（净流动性）

$$
\\text{liquidityNet}[t] = \\sum_{\\text{以 } t \\text{ 为下界的仓位}} L_i - \\sum_{\\text{以 } t \\text{ 为上界的仓位}} L_i
$$

即下界仓位的 $L$ 之和减去上界仓位的 $L$ 之和。**这是跨 tick swap 时调整活跃流动性的关键**：

- 价格上升（token0 被买入）穿过 tick $t$：进入 $t$ 上方的区间，活跃流动性 $L_{\\text{active}}$ += net$[t]$；
- 价格下降穿过 tick $t$：离开 $t$ 上方区间，$L_{\\text{active}}$ -= net$[t]$。

:::tip
直觉：仓位 $[t_a, t_b]$ 在 $t_a$（下界）注入流动性，在 $t_b$（上界）抽走流动性。所以下界 net 为正、上界 net 为负。swap 跨过边界时就增减对应净额。
:::

## feeGrowthOutside（区间外手续费增长）

为支持按区间分配手续费（第 6 章详解），每个 tick 还存 \`feeGrowthOutside0X128\` / \`feeGrowthOutside1X128\`，记录"该 tick 之外"的累计手续费增长。初始化规则：

- 若 tick $\\le$ 当前 tick：outside = 全局 feeGrowth；
- 否则：outside = 0。

## 更新时机

当 LP mint/burn 仓位时，更新其下界和上界 tick 的 gross 与 net；当 swap 跨过某 tick 时，"翻转"该 tick 的 outside 值（outside = global - outside）。这些操作都发生在 \`Tick.update\` 与 \`Tick.cross\`。

:::code-ref{id="tick-update"}
:::

:::visual{type="tick-axis"}
:::

## 小结

- \`liquidityGross\`：覆盖该 tick 的所有仓位 $L$ 之和，判断是否在用；
- \`liquidityNet\`：下界注入 - 上界抽走，跨 tick 时调整活跃流动性；
- \`feeGrowthOutside\`：为区间手续费分配做准备。

下一关讲 swap 如何用位图高效找到下一个 tick 边界。
`,
  sandbox: {
    template: `// 模拟：一个仓位 [tickLower, tickUpper] 注入流动性 L
// 它对 tickLower 的 net 贡献 +L，对 tickUpper 的 net 贡献 -L
// 函数返回这两个 tick 的 net 值（下界为正，上界为负）
function solve(L = 1000000n) {
  // TODO: 返回 { lowerNet: L, upperNet: -L }

  return { lowerNet: 0n, upperNet: 0n }
}`,
    entryFunction: 'solve',
    hints: [
      '下界（tickLower）注入流动性，net = +L',
      '上界（tickUpper）抽走流动性，net = -L',
    ],
    validator: 'exact',
    validatorKey: 'ch3-3-net',
  },
  quiz: [
    {
      type: 'choice',
      question: '某仓位 [tickLower, tickUpper] 注入流动性 L，它对 liquidityNet 的贡献是？',
      options: [
        'tickLower 的 net += L，tickUpper 的 net -= L',
        'tickLower 的 net -= L，tickUpper 的 net += L',
        '两者都 += L',
        '两者都 -= L',
      ],
      answer: 0,
      explanation: '下界注入、上界抽走，故 lower += L、upper -= L。',
    },
    {
      type: 'choice',
      question: 'liquidityGross 的作用是什么？',
      options: [
        '记录跨 tick 时的流动性变化',
        '统计覆盖该 tick 的所有仓位流动性之和，判断 tick 是否在用',
        '存储手续费',
        '记录当前价格',
      ],
      answer: 1,
      explanation: 'gross 是所有覆盖该 tick 仓位的 $L$ 之和，>0 表示 tick 已初始化。',
    },
  ],
  visuals: ['tick-axis'],
}
