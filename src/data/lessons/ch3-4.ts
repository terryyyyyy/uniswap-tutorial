import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '3-4',
  chapterId: 3,
  order: 4,
  title: 'Tick 遍历',
  summary: '理解 TickBitmap 有序位图结构，以及 nextInitializedTick 如何高效找到下一个 tick 边界。',
  content: `# Tick 遍历

swap 时价格会移动，可能跨越多个 tick 边界。合约需要高效回答：**当前 tick 的下一个已初始化 tick 在哪？** 如果用映射遍历，gas 不可控。V3 用 **位图（bitmap）** + 有序链表思想解决。

## TickBitmap 结构

把所有可能的 tick（约 177 万个）按 tickSpacing 压缩成"已用 tick 索引"，再按 256 个一组装入一个 \`uint256\` word：

- \`wordPos = compressedTick >> 8\`（每 256 个 tick 一个 word）；
- \`bitPos = compressedTick & 255\`（word 内第几位）；
- 该位为 1 表示对应 tick 已初始化。

用一个 \`mapping(int16 => uint256)\` 即可存下整个 tick 空间，**稀疏且 O(1) 定位**。

## nextInitializedTickWithinOneWord

给定当前 tick，向左（价格下降，zeroForOne）或向右（价格上升，!zeroForOne）搜索同一 word 内最近的已初始化 tick：

- 向右搜索：从 \`compressed+1\` 起的 word 内，用位运算找到最低位的 1（\`leastSignificantBit\`）；
- 向左搜索：当前 word 内找最高位的 1（\`mostSignificantBit\`）；
- 若本 word 无，跳到相邻 word 的边界继续。

这样**一次 swap step 只需 O(1) 位运算**就能找到下一个 tick 边界，而非遍历。

:::code-ref{id="tick-bitmap"}
:::

## 跨 tick 的完整流程

swap 主循环（简化）：

\`\`\`
while (还有剩余金额 && 活跃流动性 > 0):
    tickNext = nextInitializedTick(当前tick, 方向)
    sqrtTarget = getSqrtRatioAtTick(tickNext)
    step = computeSwapStep(当前sqrtPrice, sqrtTarget, 活跃L, 剩余金额, fee)
    累加 step.amountIn / amountOut / fee
    若到达 tickNext:
        活跃L += liquidityNet[tickNext]   # cross
        当前tick = tickNext ∓ 1
    更新当前 sqrtPrice
\`\`\`

每个 step 在单个 tick 区间内用 \`computeSwapStep\` 算；跨过 tick 时用 \`liquidityNet\` 增减活跃流动性，然后进入下一个区间继续。

:::tip
关键洞察：活跃流动性 $L_{\\text{active}}$ 在一个 tick 区间内是常数，只在跨 tick 边界时跳变。这让 swap 可以分段精确计算。
:::

:::visual{type="tick-axis"}
:::

## 小结

- TickBitmap 用 \`mapping(int16→uint256)\` 稀疏存储已初始化 tick，每 word 256 个；
- \`nextInitializedTick\` 用位运算 O(1) 找下一个边界；
- swap 主循环分段：每段单 tick 内 \`computeSwapStep\`，跨 tick 时 \`cross\` 调整活跃 L。

下一关做 tick 数学综合实战。
`,
  sandbox: {
    template: `// 给定当前 tick 和方向，找下一个已初始化的 tick 边界（简化版）
// 这里用 tickSpacing 模拟：下一个边界 = 当前所在区间的端点
function solve(currentTick = 30, tickSpacing = 60, zeroForOne = true) {
  // TODO: 若 zeroForOne（向左/降价），返回 <= currentTick 的最近 spacing 倍数
  //       否则（向右/涨价），返回 > currentTick 的最近 spacing 倍数
  // 提示：Math.floor(currentTick / tickSpacing) * tickSpacing 是当前区间下界

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      '向左：Math.floor(currentTick/tickSpacing)*tickSpacing，若等于 currentTick 则再减 spacing',
      '向右：(Math.floor(currentTick/tickSpacing)+1)*tickSpacing',
    ],
    validator: 'exact',
    validatorKey: 'ch3-4-next',
  },
  quiz: [
    {
      type: 'choice',
      question: 'TickBitmap 中一个 uint256 word 能表示多少个 tick？',
      options: ['32', '64', '128', '256'],
      answer: 3,
      explanation: 'wordPos = compressedTick >> 8，bitPos = & 255，每 word 256 个 tick。',
    },
    {
      type: 'choice',
      question: 'swap 跨过某个已初始化 tick 时，活跃流动性如何变化？',
      options: [
        '不变',
        '加上该 tick 的 liquidityNet',
        '减去该 tick 的 liquidityGross',
        '重置为 0',
      ],
      answer: 1,
      explanation: 'cross 时活跃 L += liquidityNet[tick]（net 可正可负，方向决定增减）。',
    },
  ],
  visuals: ['tick-axis'],
}
