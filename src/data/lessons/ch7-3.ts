import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '7-3',
  chapterId: 7,
  order: 3,
  title: 'Pool 状态管理（slot0）',
  summary: '理解 slot0 各字段的含义与读写时机，以及为何用 packed storage。',
  content: `# Pool 状态管理（slot0）

Pool 合约的状态分多个 storage slot，最核心的是 \`slot0\`，存放高频读写的价格相关字段。

## slot0 结构

\`\`\`solidity
struct Slot0 {
    uint160 sqrtPriceX96;       // 当前 √P 定点
    int24 tick;                  // 当前 tick
    uint16 observationIndex;     // 预言机最新观测索引
    uint16 observationCardinality;      // 当前观测数组容量
    uint16 observationCardinalityNext;  // 下次扩容目标
    uint8 feeProtocol;           // 协议费比例
    bool unlocked;               // 重入锁
}
\`\`\`

这些字段总大小 ≤ 256 位，**打包在一个 storage slot**——读/写各一次 SLOAD/SSTORE，省 gas。

## 字段含义

- \`sqrtPriceX96\` / \`tick\`：当前价格，swap 时更新；
- \`observation*\`：TWAP 预言机（时间加权平均价）的环形缓冲区索引与容量；
- \`feeProtocol\`：协议费比例（0=关闭，否则从 LP 手续费抽该比例给治理）；
- \`unlocked\`：重入锁，函数入口检查并置 false，防重入。

## 其他状态

- \`liquidity\`：当前活跃流动性（uint128，单独 slot）；
- \`feeGrowthGlobal0X128\` / \`feeGrowthGlobal1X128\`：全局手续费累计（各一个 slot）；
- \`ticks\` / \`positions\`：mapping，按需存储；
- \`observations\`：预言机观测数组。

:::tip
读 slot0 一次就拿到价格+tick+重入锁+预言机索引——这些在 swap/mint 路径都要用。打包存储让一次 SLOAD 全拿到，是 V3 gas 优化的典范。
:::

:::code-ref{id="slot0"}
:::

:::visual{type="flow-diagram"}
:::

## 小结

- slot0 打包存 sqrtPrice/tick/observationIndex/feeProtocol/unlocked 等高频字段；
- 打包省 gas（一次 SLOAD/SSTORE）；
- liquidity、feeGrowthGlobal 等单独 slot；ticks/positions 是 mapping。

下一关讲 NoDelegateCall 安全机制。
`,
  sandbox: {
    template: `// slot0 含多个字段。模拟：返回某次 swap 后 slot0 的关键字段
function solve() {
  // TODO: 返回 { sqrtPriceX96: bigint, tick: number, unlocked: boolean }
  // 简化：返回一个合法的 slot0 快照对象

  return { sqrtPriceX96: 0n, tick: 0, unlocked: true }
}`,
    entryFunction: 'solve',
    hints: [
      '返回对象含三个字段即可',
      '例如 { sqrtPriceX96: 2n**96n, tick: 0, unlocked: true }',
    ],
    validator: 'exact',
    validatorKey: 'ch7-3-slot0',
  },
  quiz: [
    {
      type: 'choice',
      question: 'slot0 为什么把多个字段打包在一个 storage slot？',
      options: [
        'Solidity 强制要求',
        '省 gas：一次 SLOAD/SSTORE 读写多个高频字段',
        '为了安全',
        '地址更短',
      ],
      answer: 1,
      explanation: '打包存储让一次存储读写拿到多个字段，大幅省 gas。',
    },
    {
      type: 'choice',
      question: 'slot0 中的 unlocked 字段作用是？',
      options: [
        '记录池是否已初始化',
        '重入锁，防止函数执行中再次进入',
        '记录当前价格',
        '记录 LP 数量',
      ],
      answer: 1,
      explanation: 'unlocked 是重入锁，函数入口置 false，防重入攻击。',
    },
  ],
  visuals: ['flow-diagram'],
}
