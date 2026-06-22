import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '7-2',
  chapterId: 7,
  order: 2,
  title: 'UniswapV3Pool 初始化',
  summary: '理解 initialize 设置初始 sqrtPrice 与 tick，以及为何只能初始化一次。',
  content: `# UniswapV3Pool 初始化

池子部署后处于"未初始化"状态（sqrtPriceX96=0），必须调 \`initialize\` 设定首个价格才能交易。

## initialize

\`\`\`solidity
function initialize(uint160 sqrtPriceX96) external {
    require(slot0.sqrtPriceX96 == 0, 'AI');
    int24 tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);
    slot0 = Slot0({ sqrtPriceX96, tick, observationIndex: 0, ... });
}
\`\`\`

- 校验当前 sqrtPriceX96 == 0（只能初始化一次，\`AI\` = already initialized）；
- 由 sqrtPriceX96 算出对应 tick；
- 写入 slot0。

## 为什么单独初始化

CREATE2 部署时构造函数**不能传参设价**（否则不同价格需不同部署参数，破坏地址确定性）。所以分两步：部署（无参，地址确定）+ initialize（设价）。通常由 createPool 的调用方紧接着调 initialize。

:::tip
首次注入流动性时的价格就由 initialize 设定。LP 第一笔 mint 必须基于该价格。之后价格完全由 swap 驱动，再也不能人为设置。
:::

## slot0 是什么

slot0 是 Pool 的核心状态打包存储（第 7-3 关详解），含 sqrtPriceX96、tick、observationIndex、observationCardinality 等。它被打包在一个 storage slot 里以省 gas（读写一次 32 字节）。

:::code-ref{id="pool-initialize"}
:::

:::visual{type="flow-diagram"}
:::

## 小结

- initialize 设首个 sqrtPriceX96 与 tick，只能一次；
- 分两步部署因 CREATE2 需无参构造保证地址确定；
- 状态存 slot0（打包省 gas）。

下一关详解 slot0 与 Pool 状态管理。
`,
  sandbox: {
    template: `// 模拟 initialize：由 sqrtPriceX96 算 tick
// 可用全局 getTickAtSqrtRatio(sqrtPriceX96) -> number
function solve(sqrtPriceX96 = 79228162514264337593543950336n) {
  // TODO: 2n**96n 对应价格 1.0，tick 应为 0
  // 返回对应 tick

  return 0
}`,
    entryFunction: 'solve',
    hints: [
      'return getTickAtSqrtRatio(sqrtPriceX96)',
      '2n**96n = √1.0 * 2^96，对应 tick 0',
    ],
    validator: 'exact',
    validatorKey: 'ch7-2-init',
  },
  quiz: [
    {
      type: 'fill',
      question: 'Pool 部署后，必须调用哪个函数设定首个价格？',
      answer: 'initialize',
      explanation: 'initialize(sqrtPriceX96) 设首个价格与 tick，只能调用一次。',
    },
    {
      type: 'choice',
      question: '为什么 createPool 不在构造函数里设价？',
      options: [
        '构造函数不能传参',
        'CREATE2 需无参构造保证地址确定性，故分部署与 initialize 两步',
        '设价要收 gas',
        '治理禁止',
      ],
      answer: 1,
      explanation: 'CREATE2 地址由部署参数决定，无参构造保证地址可预计算，设价延后到 initialize。',
    },
  ],
  visuals: ['flow-diagram'],
}
