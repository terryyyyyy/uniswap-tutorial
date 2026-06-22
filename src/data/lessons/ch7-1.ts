import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '7-1',
  chapterId: 7,
  order: 1,
  title: 'UniswapV3Factory',
  summary: '理解 Factory 的 createPool（CREATE2 部署）、getPool、owner 管理与 mapping key。',
  content: `# UniswapV3Factory

Factory 是 V3 的部署入口——所有池子由它创建和管理。理解它能看清 V3 的池子寻址与治理。

## createPool

\`\`\`solidity
function createPool(address token0, address token1, uint24 fee) external returns (address pool)
\`\`\`

逻辑：

1. **排序 token**：token0 < token1（地址数值小的在前），消除 (A,B) 与 (B,A) 的重复；
2. **校验**：token0 != token1，fee 是合法档，该 (token0,token1,fee) 组合未存在；
3. **CREATE2 部署**：用确定性地址部署新 Pool（地址可由 (token0,token1,fee) + deployer 预计算）；
4. **注册**：写入 \`mapping(token0,token1,fee) → pool\` 和 \`getPool(token0,token1) → 所有 fee 的池数组\`；
5. 调 \`pool.initialize(sqrtPriceX96)\` 由调用方后续触发。

:::tip
CREATE2 让池地址在部署前就可计算——外围合约（如 SwapRouter）能根据 (token0,token1,fee) 直接算出池地址并交互，无需链上查询。这是 V3 gas 优化的关键。
:::

## getPool

\`getPool(tokenA, tokenB)\` 返回该交易对所有费率档的池地址数组（按 fee 升序）。或用 \`getPool(token0, token1, fee)\` 精确取单个。

## owner 与治理

Factory 有个 owner（通常 Uniswap 治理多签），可：

- \`enableFeeAmount(fee, tickSpacing)\`：新增费率档（如后期加的 0.01%）；
- \`setOwnerProtocolFee\`：开/关协议费（从 LP 手续费抽一部分给 UNI 持有者）。

owner 不能动用户资金、不能改已有池参数——治理权限受限，保安全。

:::code-ref{id="factory-create-pool"}
:::

:::visual{type="flow-diagram"}
:::

## 小结

- Factory 用 CREATE2 部署池，地址可预计算；
- token0 < token1 排序消除重复；
- mapping key = (token0, token1, fee)；
- owner 治理权限受限（加费率档、协议费）。

下一关讲 Pool 的初始化。
`,
  sandbox: {
    template: `// 模拟 Factory.createPool：返回池标识 key
function solve(tokenA = '0xaaa', tokenB = '0xbbb', fee = 3000) {
  // TODO: 1) 排序 token0 < token1（字符串比较）
  //       2) 返回 "token0:token1:fee" 格式 key

  return ''
}`,
    entryFunction: 'solve',
    hints: [
      'const [a, b] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]',
      'return \`\${a}:\${b}:\${fee}\`',
    ],
    validator: 'exact',
    validatorKey: 'ch7-1-key',
  },
  quiz: [
    {
      type: 'choice',
      question: 'Factory.createPool 为什么要对 token 排序（token0 < token1）？',
      options: [
        '为了 gas 更省',
        '消除 (A,B) 与 (B,A) 的重复，统一池标识',
        '排序后地址更短',
        '治理要求',
      ],
      answer: 1,
      explanation: '排序后 (A,B) 与 (B,A) 映射到同一 key，避免重复建池。',
    },
    {
      type: 'choice',
      question: 'V3 池地址用什么方式部署，为何？',
      options: [
        'CREATE1，随机地址',
        'CREATE2，地址可由 (token0,token1,fee) 预计算，外围无需链上查询',
        '硬编码',
        '由 owner 手动指定',
      ],
      answer: 1,
      explanation: 'CREATE2 确定性部署，外围可预计算地址直接交互，省 gas。',
    },
  ],
  visuals: ['flow-diagram'],
}
