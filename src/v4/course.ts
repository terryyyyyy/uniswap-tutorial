const docs = 'https://developers.uniswap.org/docs'
const concepts = docs + '/protocols/v4/concepts'
const core = 'https://github.com/Uniswap/v4-core/blob/main/src'

export type LessonId = 'swap' | 'liquidity' | 'pool-manager' | 'hooks' | 'fees' | 'settlement'

export interface Lesson {
  id: LessonId
  title: string
  topic: string
  description: string
  minutes: number
  lab: { title: string; instruction: string }
  takeaways: { title: string; text: string }[]
  quiz: { question: string; choices: string[]; answer: number; explanation: string; hint: string }
  deeper: { text: string; code?: string; link: string; label: string }
}

export const lessons: Lesson[] = [
  {
    id: 'swap',
    title: '从一笔兑换开始',
    topic: 'Swap',
    description: '用 USDC 换一点 ETH，看看为什么交易金额会改变成交价格。',
    minutes: 4,
    lab: { title: '试着换一点 ETH', instruction: 'USDC 是一种美元稳定币，ETH 是以太坊的原生资产。拖动金额滑条，比较小额和大额交易的平均成交价。' },
    takeaways: [
      { title: '流动性池像一个自动兑换柜台', text: '你交给池子 USDC，池子给你 ETH。报价根据池里的资产和交易规模计算，因此不必等另一位买家出现。' },
      { title: '价格影响和手续费是两件事', text: '买走的 ETH 越多，沿途的 ETH 报价越高，形成价格影响。手续费则按费率从输入金额中扣除。' },
    ],
    quiz: {
      question: '在同一个池子里，从同一初始状态出发，买更多 ETH 会怎样？',
      choices: ['平均每枚 ETH 更便宜', '平均每枚 ETH 更贵', '每枚 ETH 的成交价始终相同'],
      answer: 1,
      explanation: '买走更多 ETH 会把价格推得更远，因此整笔交易的平均买入价格会更高。',
      hint: '把金额从 100 调到 2,000 USDC，比较两次的平均成交价。',
    },
    deeper: {
      text: '实验把池子简化为 10 ETH 和 20,000 USDC 的恒定乘积曲线，并固定 0.30% LP 费率。实际 v4 的默认池会沿不同流动性区间逐段成交，报价还可能受协议费、Hook 或价格限制影响。',
      label: 'v4 SwapMath 源码',
      link: core + '/libraries/SwapMath.sol',
    },
  },
  {
    id: 'liquidity',
    title: '把流动性放进区间',
    topic: 'Concentrated Liquidity',
    description: '用价格滑块观察一个仓位什么时候参与交易、什么时候停止赚手续费。',
    minutes: 5,
    lab: { title: '观察价格进出你的区间', instruction: '选一个区间，再拖动当前价格穿过边界。' },
    takeaways: [
      { title: '选定一个价格区间', text: '如果你只愿意在 1,800 到 2,200 USDC 的价格提供 ETH/USDC 流动性，可以把资金集中到这段范围。v4 延续了 v3 的这个设计。' },
      { title: '越窄，越容易出界', text: '在当前价格附近，同样资金放进较窄的区间能提供更深的流动性。价格一旦离开区间，这个仓位就停止参与成交，也停止分得新的兑换手续费。' },
    ],
    quiz: {
      question: '你选的是 1,900–2,100 的窄区间。价格涨到 2,250 时，这个仓位会怎样？',
      choices: ['继续参与成交并赚取新的手续费', '暂时退出成交，价格回到区间内可以恢复', '仓位自动跟着价格移动'],
      answer: 1,
      explanation: '价格超过上界，仓位退出活跃区间。等价格回到区间内，仓位可以重新参与成交。',
      hint: '切换到窄区间，把价格调到 2,250，看看状态提示。',
    },
    deeper: {
      text: '协议用 Tick 表示价格网格，用 tickSpacing 约束可选边界。核心按 tickLower ≤ 当前 Tick < tickUpper 判断仓位内外。图上价格是便于观察的教学数值。核心以所有者、上下界和 salt 区分仓位。外围 PositionManager 用 NFT 表示用户持有的仓位。',
      label: '官方集中流动性指南',
      link: docs + '/get-started/concepts/liquidity-providers/concentrated-liquidity',
    },
  },
  {
    id: 'pool-manager',
    title: '认识 PoolManager',
    topic: 'Singleton',
    description: '切换 v3 和 v4 的结构，看看多个池子如何住进同一个合约。',
    minutes: 5,
    lab: { title: '同样三个池，两种组织方式', instruction: '切换版本，选择任一池子查看它是怎么被标识的。' },
    takeaways: [
      { title: '同一个合约，多套池状态', text: 'v4 在同一个 PoolManager 合约里管理多个池子。每个池仍有自己的价格、区间、费率和仓位。' },
      { title: '同一对币可以有多个池', text: 'PoolKey 由排序后的两种资产、费率字段、Tick 间距和 Hook 地址组成。任何一项不同，都会标识不同的池。v4 还支持直接使用原生 ETH。' },
    ],
    quiz: {
      question: '两个 v4 池的币种相同，但 Hook 地址不同。它们有什么关系？',
      choices: ['由 PoolManager 分开记录，是不同的池', '共享同一份价格和仓位状态', '系统会把后建立的池合进第一个'],
      answer: 0,
      explanation: 'Hook 地址是 PoolKey 的一部分。即使币种和费率相同，两个池仍有独立状态。',
      hint: '选中 ETH / USDC 的两个池子，比较它们的 PoolKey。',
    },
    deeper: {
      text: 'PoolManager.initialize 用 PoolKey 初始化一份池状态。PoolId 是对完整 PoolKey 的 ABI 编码做 keccak256 的结果。调用时仍需提供 PoolKey。原生 ETH 在 Currency 中用零地址表示，排在任何 ERC-20 地址之前。',
      code: 'PoolKey → keccak256(abi.encode(key)) → PoolId\nPoolManager → pools[PoolId] → Pool.State',
      label: 'PoolManager 官方说明',
      link: concepts + '/poolmanager',
    },
  },
  {
    id: 'hooks',
    title: '在兑换前后插入规则',
    topic: 'Hooks',
    description: '开关 Hook 回调，播放一笔兑换，观察规则在什么时候执行。',
    minutes: 6,
    lab: { title: '拆开一笔兑换的时间线', instruction: '保留两个回调或关闭其中一个，逐步播放这笔兑换。' },
    takeaways: [
      { title: '在关键动作前后执行自定义逻辑', text: 'Hook 是池子在初始化时选定的可选合约。它可以在兑换前检查条件，在兑换后记录数据，也能介入创建池、增减流动性等操作。' },
      { title: '同一对币，不同的交易规则', text: '一个池最多关联一个 Hook 合约。同一个 Hook 可以服务多个池。你在界面里切换的是几种假想池配置，实际池子的回调权限由 Hook 地址低位确定。' },
    ],
    quiz: {
      question: '一条规则要在兑换处理之前检查交易条件，应当放在哪个回调？',
      choices: ['afterSwap', 'afterAddLiquidity', 'beforeSwap'],
      answer: 2,
      explanation: 'beforeSwap 在核心兑换前执行，适合前置检查。afterSwap 可以使用兑换后的信息。',
      hint: '播放实验时间线，观察哪一步排在「执行兑换」前面。',
    },
    deeper: {
      text: 'PoolManager 按 Hook 地址低位的权限标志决定是否调用对应回调。带返回 Delta 的回调还需要对应的附加权限，能参与自定义记账。使用带 Hook 的池时，实际行为取决于该合约的实现。',
      code: 'beforeSwap → Pool.swap → afterSwap',
      label: '官方 Hooks 文档',
      link: concepts + '/hooks',
    },
  },
  {
    id: 'fees',
    title: '让手续费随规则变化',
    topic: 'Dynamic Fees',
    description: '对照固定费率和动态费率，观察同一笔交易要付多少。',
    minutes: 5,
    lab: { title: '比较固定费率与动态费率', instruction: '改变示例的市场波动程度，比较 1,000 USDC 的交易在两种池子里要付多少手续费。' },
    takeaways: [
      { title: '固定费率写进池配置', text: '对静态 LP 费率池，池的费率在初始化时确定。动态费率池则在初始化时选择动态模式，由关联的 Hook 按自身规则改变 LP 费率。' },
      { title: '波动只是本实验选的一种规则', text: '实验用低波动时低收费、高波动时高收费的例子。真实 Hook 也可能参考时段或其他信号。LP 手续费、协议费和 Hook 自定义费用需要分别看。' },
    ],
    quiz: {
      question: '两个 v4 动态费率池在相同市场波动下，一定使用相同的费率吗？',
      choices: ['一定，v4 把波动率直接转换为统一费率', '一定，PoolManager 统一设定 0.30%', '不一定，费率由各池关联的 Hook 规则决定'],
      answer: 2,
      explanation: 'v4 提供动态费率机制，Hook 可以采用不同的策略，也可以用不同的更新频率。',
      hint: '实验里这条随波动变化的曲线，只是一种可能的规则。',
    },
    deeper: {
      text: 'LP 费率单位是百万分之一，3000 代表 0.30%。动态池在 PoolKey 里使用 0x800000 标志。关联的 Hook 可以更新存储费率，也可通过 beforeSwap 返回带 0x400000 覆盖标志的费率用于单次兑换。',
      label: '官方动态费率文档',
      link: concepts + '/dynamic-fees',
    },
  },
  {
    id: 'settlement',
    title: '交易做完，再算总账',
    topic: 'Flash Accounting',
    description: '走完两跳兑换，看看中间币如何抵消，以及漏结算时会发生什么。',
    minutes: 7,
    lab: { title: '亲手结算一笔两跳兑换', instruction: '逐步用 USDC 换 WETH，再换成 DAI。试试漏付 USDC 时会发生什么。' },
    takeaways: [
      { title: '先记每种币的净变化', text: '两跳都经过同一个 PoolManager。第一跳应收的 WETH（包装后的 ETH）正好抵消第二跳应付的 WETH，最终只需付 USDC 和收 DAI。' },
      { title: '回调返回前，账必须结清', text: '外围合约先 unlock，在 unlockCallback 中执行操作并结算。负数代表调用者欠 PoolManager，正数代表调用者可领取，尚有余额时整个 unlock 调用回滚。' },
    ],
    quiz: {
      question: '如果两跳中应收和应付的 WETH 数量正好相等，最终需要为这笔路线转出再转入 WETH 吗？',
      choices: ['不用，WETH 净额为零', '需要，每跳都要先把 WETH 转到钱包', '需要，PoolManager 会把 WETH 强制换成原生 ETH'],
      answer: 0,
      explanation: '同一个调用者对 WETH 的两笔变化抵消，只需结算剩下的 USDC 和 DAI。',
      hint: '走到第二跳兑换，先看 WETH 的净额，再点击结算。',
    },
    deeper: {
      text: 'v4 用临时存储追踪调用者与资产的余额变化。常见 ERC-20 支付流程是 sync、转账、settle，领取使用 take，原生 ETH 可随 settle 发送。在常见用户流程中，Universal Router 负责兑换，PositionManager 管理流动性仓位，它们都通过 PoolManager 执行核心操作。',
      code: 'unlock → unlockCallback\n  swap → swap → settle / take\n  所有 Delta 归零 → 返回',
      label: '官方 Flash Accounting 文档',
      link: concepts + '/flash-accounting',
    },
  },
]
