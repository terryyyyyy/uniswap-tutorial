import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '7-4',
  chapterId: 7,
  order: 4,
  title: 'NoDelegateCall',
  summary: '理解 NoDelegateCall 如何禁止 delegatecall，防止代理调用绕过检查。',
  content: `# NoDelegateCall

Pool 继承自 \`NoDelegateCall\`，这是一个安全基类，禁止合约被以 \`delegatecall\` 方式调用。理解它要知道 delegatecall 的风险。

## delegatecall 的风险

\`delegatecall\` 让被调合约在**调用者**的存储上下文中执行代码。如果有人用 delegatecall 调用 V3 Pool 的方法：

- Pool 的代码在攻击者合约的存储里跑；
- 但 V3 的状态布局（slot0、liquidity、ticks...）与攻击者存储不匹配 → 读写错位；
- 更危险：Pool 里某些检查依赖"自己是 Pool"（如 callback 验证），delegatecall 下这些检查可能被绕过。

:::warning
delegatecall 不改变 msg.sender，但执行在被调方上下文。许多 DeFi 攻击利用合约未防 delegatecall，导致状态错乱或权限绕过。
:::

## NoDelegateCall 实现

\`\`\`solidity
abstract contract NoDelegateCall {
    address private immutable original;
    constructor() { original = address(this); }
    modifier noDelegateCall() {
        require(address(this) == original, "DELEGATE");
        _;
    }
}
\`\`\`

- 构造时记录原始部署地址 \`original\`（immutable，不可改）；
- 关键函数加 \`noDelegateCall\` 修饰器：检查 \`address(this) == original\`；
- delegatecall 下 \`address(this)\` 是调用者（攻击者）地址，不等于 original → revert。

## 为什么 V3 需要

Pool 的 swap/mint 用 callback 模式，回调时验证调用方确实是预期 Pool。若被 delegatecall，攻击者可在自己存储里伪造状态，骗过 callback 验证。NoDelegateCall 从根上杜绝此路。

:::tip
immutable 变量存在代码字节码里（非存储），delegatecall 不会改变它——所以 \`original\` 始终是真实 Pool 地址，检查可靠。
:::

:::code-ref{id="no-delegate-call"}
:::

:::visual{type="flow-diagram"}
:::

## 小结

- delegatecall 让代码在调用者存储执行，有状态错位/权限绕过风险；
- NoDelegateCall 用 immutable original + 修饰器禁止 delegatecall；
- V3 关键函数加此保护，保障 callback 验证可靠。

下一关做核心合约综合实战。
`,
  sandbox: {
    template: `// 模拟 NoDelegateCall 检查：比较当前地址与原始地址
function solve(currentAddr = '0xabc', originalAddr = '0xabc') {
  // TODO: 若相等返回 true（允许），否则 false（拒绝）

  return false
}`,
    entryFunction: 'solve',
    hints: [
      'return currentAddr === originalAddr',
    ],
    validator: 'exact',
    validatorKey: 'ch7-4-nodelegate',
  },
  quiz: [
    {
      type: 'choice',
      question: 'delegatecall 的危险在于？',
      options: [
        'gas 太贵',
        '代码在调用者存储上下文执行，可能导致状态错位或权限绕过',
        '不能转账',
        '只能内部调用',
      ],
      answer: 1,
      explanation: 'delegatecall 在调用者存储执行被调方代码，状态布局不匹配会错乱，且可能绕过检查。',
    },
    {
      type: 'choice',
      question: 'NoDelegateCall 如何实现禁止 delegatecall？',
      options: [
        '用 immutable 记录原始地址，函数入口检查 address(this) == original',
        '删除所有函数',
        '设为 private',
        '用 require(msg.sender == tx.origin)',
      ],
      answer: 0,
      explanation: 'immutable original 不可被 delegatecall 篡改，入口比较 address(this) 与 original。',
    },
  ],
  visuals: ['flow-diagram'],
}
