import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '5-5',
  chapterId: 5,
  order: 5,
  title: 'Swap 综合实战',
  summary: '综合配置池子（初始化+多 LP）后执行大额 swap，观察跨 tick 与价格影响。',
  content: `# Swap 综合实战

本关把前 4 关串联：创建池 → 初始化 → 多个 LP 提供不同区间流动性 → 执行大额 swap → 观察跨 tick、价格影响、手续费累计。

## 场景

- 池：A/B，0.3% 费率（tickSpacing=60）；
- 初始价 1.0（sqrtPriceX96 = $2^{96}$）；
- LP1 在 $[-600, 600]$ 注入 100 万对（覆盖当前价）；
- LP2 在 $[600, 1800]$ 注入 50 万对（上方区间，价格涨到 1.06+ 才做市）；
- 执行大额 swap：用 token0 买 token1，金额足够大以跨越 tick 0 上方的多个边界。

## 预期现象

1. 价格从 1.0 上升（token0 被买入）；
2. 在 $[-600, 600]$ 区间内，活跃 $L$ = LP1 的流动性，价格缓慢上升；
3. 跨过 tick 600 时，LP2 加入做市，活跃 $L$ 增大，价格上升斜率变缓（流动性变深）；
4. 手续费按 swap 方向累计到 feeGrowthGlobal0X128；
5. 返回结果含 tickCrossed 数组，记录跨过的已初始化 tick。

:::visual{type="swap-animation"}
:::

## 实操

在沙盒里用 \`createPool\` + \`initialize\` + 两次 \`mint\` + \`swap\` 完成上述流程，返回 swap 结果。观察 \`tickCrossed\` 是否包含 600（LP2 的下界）。

## 小结

- 多 LP 不同区间 → 活跃 $L$ 沿价格轴呈分布；
- swap 跨过某 LP 下界时该 LP 加入做市，$L$ 增大；
- 大额 swap 可跨越多个 tick，tickCrossed 记录路径。

第 5 章结束。下一章讲手续费计算的细节。
`,
  sandbox: {
    template: `// 综合实战：多 LP + 大额 swap
function solve() {
  // TODO:
  // 1) createPool('A','B',3000)
  // 2) initialize(2n**96n)
  // 3) mint('lp1', -600, 600, 1000000n*10n**18n, 1000000n*10n**18n)
  // 4) mint('lp2', 600, 1800, 500000n*10n**18n, 500000n*10n**18n)
  // 5) swap(800000n*10n**18n, false)  // token1->token0 涨价方向
  // 返回 swap 结果（含 tickCrossed）

  return null
}`,
    entryFunction: 'solve',
    hints: [
      'p = createPool("A","B",3000); p.initialize(2n**96n); p.mint("lp1",-600,600,1000000n*10n**18n,1000000n*10n**18n); p.mint("lp2",600,1800,500000n*10n**18n,500000n*10n**18n); return p.swap(800000n*10n**18n,false)',
      '注意 false 是 token1->token0（涨价），swap 的 zeroForOne 参数',
    ],
    validator: 'exact',
    validatorKey: 'ch5-5-multi',
  },
  quiz: [
    {
      type: 'choice',
      question: '当 swap 使价格涨过某 LP 的下界 tick 时，该 LP 会怎样？',
      options: [
        '被强制移除',
        '加入做市，活跃 L 增大',
        '损失全部资金',
        '手续费清零',
      ],
      answer: 1,
      explanation: '价格进入其区间后该 LP 开始做市，活跃 L 增大，流动性变深。',
    },
    {
      type: 'choice',
      question: 'swap 返回的 tickCrossed 数组记录什么？',
      options: [
        '所有 tick',
        '本次 swap 跨过的已初始化 tick 边界',
        '未初始化的 tick',
        '当前价格',
      ],
      answer: 1,
      explanation: 'tickCrossed 记录 swap 过程中 cross 过的已初始化 tick。',
    },
  ],
  visuals: ['swap-animation'],
}
