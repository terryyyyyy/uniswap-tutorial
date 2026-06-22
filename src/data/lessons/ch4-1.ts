import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '4-1',
  chapterId: 4,
  order: 1,
  title: 'Position 数据结构',
  summary: '理解 V3 中 Position 由 owner + tickLower + tickUpper 唯一确定，以及为何用 NFT。',
  content: `# Position 数据结构

V2 里每个 LP 在池中的份额是可互换的 ERC20（份额相同、价格区间相同=全范围）。V3 因为每个 LP 可选不同区间，仓位不再可互换，必须用更细粒度的结构。

## Position 的唯一标识

V3 中，一个仓位由三元组唯一确定：

$$
\\text{positionKey} = \\text{keccak256}(\\text{owner}, \\text{tickLower}, \\text{tickUpper})
$$

即"谁 + 在哪个区间"唯一确定一个仓位。同一个 owner 在同一区间多次 mint 会**累加**到同一个 Position（而非新建）。

## Position 存储的字段

\`\`\`solidity
struct Position {
    uint128 liquidity;          // 该仓位提供的活跃流动性 L
    uint256 feeGrowthInside0LastX128;  // 上次结算时 token0 的区间内手续费增长
    uint256 feeGrowthInside1LastX128;  // 上次结算时 token1 的区间内手续费增长
    uint128 tokensOwed0;        // 待领取的 token0 手续费
    uint128 tokensOwed1;        // 待领取的 token1 手续费
}
\`\`\`

- \`liquidity\`：当前活跃 $L$，mint 增加、burn 减少；
- \`feeGrowthInside*Last\`：记录上次结算的"区间内累计手续费"，用于增量计算新增手续费（第 6 章）；
- \`tokensOwed*\`：累计应得但未领取的手续费，\`collect\` 时转出。

:::code-ref{id="position-update"}
:::

## 为什么用 NFT

V2 用 ERC20：所有 LP 份额等价，可互换、可合并。V3 仓位因区间不同而各异：

- 不同 LP 区间不同 → 仓位价值、风险、手续费收益都不同 → 不可互换；
- 同一 LP 可有多个不同区间的仓位 → 需要唯一标识每个。

所以 V3 外围合约 \`NonfungiblePositionManager\` 用 **ERC721（NFT）** 代表仓位：每个 tokenId 对应一个 (owner, tickLower, tickUpper, pool, fee) 仓位。这并非为了"炒作 NFT"，而是技术必需。

:::tip
可以把 V3 的 NFT 理解为"仓位的产权证"：它记录这个仓位属于谁、在哪个池的哪个区间、有多少流动性。转让 NFT 即转让整个仓位。
:::

:::visual{type="position-range"}
:::

## 小结

- Position 由 (owner, tickLower, tickUpper) 唯一确定，同 owner 同区间累加；
- 存储 liquidity + feeGrowthInsideLast + tokensOwed；
- 区间差异导致仓位不可互换 → 用 ERC721 NFT 代表。

下一关讲 mint（添加流动性）的具体流程与代币数量计算。
`,
  sandbox: {
    template: `// 一个仓位由 (owner, tickLower, tickUpper) 唯一确定
// 返回该仓位的标识 key（字符串形式即可）
function solve(owner = 'alice', tickLower = -600, tickUpper = 600) {
  // TODO: 返回 "owner:tickLower:tickUpper" 格式的字符串

  return ''
}`,
    entryFunction: 'solve',
    hints: [
      '用字符串拼接：owner + ":" + tickLower + ":" + tickUpper',
      '或用模板字符串 ${owner}:${tickLower}:${tickUpper}',
    ],
    validator: 'exact',
    validatorKey: 'ch4-1-key',
  },
  quiz: [
    {
      type: 'choice',
      question: 'V3 中，一个 Position 由什么唯一确定？',
      options: [
        'tokenId',
        'owner + tickLower + tickUpper',
        '流动性数量 L',
        '池地址',
      ],
      answer: 1,
      explanation: 'positionKey = keccak256(owner, tickLower, tickUpper)，三元组唯一确定仓位。',
    },
    {
      type: 'choice',
      question: '为什么 V3 用 NFT（ERC721）而不是 ERC20 代表仓位？',
      options: [
        '为了在二级市场炒作',
        '因为不同 LP 区间不同，仓位不可互换，需唯一标识',
        'ERC20 在 V3 中无法实现',
        'NFT 手续费更低',
      ],
      answer: 1,
      explanation: '区间差异使仓位各异、不可互换，ERC721 提供唯一标识与产权转移。',
    },
  ],
  visuals: ['position-range'],
}
