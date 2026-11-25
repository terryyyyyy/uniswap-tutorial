import type { Lesson, LessonId } from '../course'
import { coreCommit, peripheryCommit } from './model'

interface TraceStep {
  label: string
  location: string
  source: string
  explanation: string
  code: string
}

export interface ImplementationLesson {
  title: string
  summary: string
  bridge: string
  invariant: string
  steps: TraceStep[]
  exercise: { title: string; instruction: string }
  quiz: Lesson['quiz']
  foundry: string
  practice: string
}

const core = (path: string) => 'https://github.com/Uniswap/v4-core/blob/' + coreCommit + '/src/' + path
const periphery = (path: string) => 'https://github.com/Uniswap/v4-periphery/blob/' + peripheryCommit + '/src/' + path

export const implementation: Record<LessonId, ImplementationLesson> = {
  swap: {
    title: '追踪 Pool.swap 的循环',
    summary: '从 SwapParams 走到 BalanceDelta，拆开精确输入与精确输出、Tick 搜索、步进取整、价格限制和最终的状态提交。',
    bridge: '刚才交易金额变大，平均成交价跟着变化。合约怎样算出每一段价格能成交多少，又怎样在触及价格限制时停下来？',
    invariant: '核心约定是 amountSpecified < 0 表示 exact input，> 0 表示 exact output。zeroForOne 由币种方向决定，和前者是两条独立分支。',
    steps: [
      {
        label: '构造参数', location: 'V4Router._swapExactInputSingle',
        source: periphery('V4Router.sol#L84-L100'),
        explanation: '外围把正的用户输入取负后交给核心。单池 exact-in 检查输出下限，所选快照还支持可选的每跳价格下限。核心接受价格限制导致的部分成交，外围决定是否接受结果。',
        code: 'int256 specified = -int256(uint256(amountIn));\nBalanceDelta d = manager.swap(key, params, hookData);\n// 外围根据 zeroForOne 取出输出币的正向 delta，再检查下限。',
      },
      {
        label: '寻找边界', location: 'Pool.swap → TickBitmap → SwapMath',
        source: core('libraries/Pool.sol#L345-L377'),
        explanation: '位图每次只检查当前 word 内的边界，可能返回一个未初始化的搜索边界。向左时两种目标中取较高的 sqrtPrice，向右取较低，以确保不会越过调用者的价格限制。',
        code: 'target = zeroForOne\n    ? max(nextTickPriceX96, sqrtPriceLimitX96)\n    : min(nextTickPriceX96, sqrtPriceLimitX96);',
      },
      {
        label: '计算单步', location: 'SwapMath.computeSwapStep',
        source: core('libraries/SwapMath.sol#L51-L106'),
        explanation: 'exact-in 先从预算里划出费用，剩余输入向下取整。输入数量的边界计算向上取整，输出向下取整。exact-out 先封顶本步可输出量，再反算输入和向上取整的费用。到达边界时只消耗必要的输入。',
        code: 'remaining += int256(amountIn + feeAmount); // exact input\nremaining -= int256(amountOut);            // exact output\n// 循环判断 remaining == 0 或价格已到 limit。',
      },
      {
        label: '写回状态', location: 'Pool.swap → PoolManager._swap',
        source: core('libraries/Pool.sol#L406-L460'),
        explanation: '跨过初始化边界时读取 liquidityNet，需要的话反转符号。最终写回 Slot0、活跃流动性和输入币的 feeGrowthGlobal。Swap 事件在 afterSwap 之前发出，事件 delta 与经过 Hook 调整的调用者 delta 可能不同。',
        code: 'tick = zeroForOne ? tickNext - 1 : tickNext;\nslot0 = slot0Start.setTick(tick).setSqrtPriceX96(price);\n// BalanceDelta 的两个 int128 都是调用者视角。',
      },
    ],
    exercise: { title: '检查单个 Swap 步的整数结果', instruction: '从 Tick 0 出发，两侧初始化边界是 ±120，可将价格限制收紧到 ±60。切换方向和模式，检查在相同流动性 1,000,000 与费率 3000 pips 下的剩余额度和 Delta。' },
    quiz: {
      question: '核心 exact-input 在价格限制处提前停止，调用者该按什么结算实际花费？',
      choices: ['原始 amountSpecified 的绝对值', '对应输入币实际产生的负 delta', '需要精确等于 sqrtPriceLimitX96'],
      answer: 1, explanation: '输入预算可有未用完的部分。按实际负 delta 支付，并由外围做滑点检查。',
      hint: '打开近端价格限制，提高输入预算，观察 remaining 与输入币 delta。',
    },
    foundry: 'testSwap',
    practice: '把 testSwapReturnsActualDeltaAtPriceLimit 的限制从 Tick −10 改成 −20，比较实际支付和价格写回。再把外围测试的 amountOutMinimum 调高，核对 V4TooLittleReceived 由哪一层抛出。',
  },
  liquidity: {
    title: '拆开 Tick、仓位与 PositionManager',
    summary: '沿 modifyLiquidity 读懂区间装载、边界流动性、位置标识、费用检查点，以及外围 ERC-721 如何关联核心仓位。',
    bridge: '刚才价格越过区间后，仓位退出了成交。合约在哪一步更新活跃流动性，又把两侧的费用记在哪里？',
    invariant: '核心仓位按 PoolId 分池，再以 owner、tickLower、tickUpper、salt 区分。通过 PositionManager 创建时，核心 owner 是管理器合约，用户的 tokenId 用作 salt。',
    steps: [
      {
        label: '定位仓位', location: 'PositionManager._mint',
        source: periphery('PositionManager.sol#L353-L385'),
        explanation: 'PositionManager 先分配 tokenId 并铸造 NFT，再以该 tokenId 派生 salt 调用核心。最大投入限制验证的是 mint 产生的本金 delta。增加或减少既有仓位时，外围会将已累积费用剥离后检查本金滑点。',
        code: 'bytes32 salt = bytes32(tokenId);\n// PoolManager 看到的 msg.sender 是 PositionManager。\nModifyLiquidityParams memory change = /* ticks, liquidityDelta, salt */;',
      },
      {
        label: '更新 Tick', location: 'Pool.modifyLiquidity → updateTick',
        source: core('libraries/Pool.sol#L146-L193'),
        explanation: '下边界累计 +ΔL，上边界累计 −ΔL。liquidityGross 表示引用该边界的流动性总量，跨过零才会翻转位图。只在 tickLower ≤ 当前 tick < tickUpper 时变更当前活跃流动性。',
        code: 'lower.liquidityNet += liquidityDelta;\nupper.liquidityNet -= liquidityDelta;\n// gross 在零与非零之间切换时翻转 bitmap。',
      },
      {
        label: '计算本金', location: 'Pool.modifyLiquidity → SqrtPriceMath',
        source: core('libraries/Pool.sol#L195-L250'),
        explanation: '当前 Tick 在区间下方时需要 currency0，在上方时需要 currency1，区间内通常两种都需要。添加仓位 principal delta 为负，移除为正。增减使用不同取整方向以保护池子。',
        code: 'if (tick < tickLower) { /* amount0 */ }\nelse if (tick < tickUpper) { /* amount0 + amount1 */ }\nelse { /* amount1 */ }',
      },
      {
        label: '更新费用', location: 'Pool.getFeeGrowthInside → Position.update',
        source: core('libraries/Pool.sol#L488-L516'),
        explanation: '费用按区间内累计增长与仓位旧检查点之差计算，再用旧仓位流动性乘以增长差除以 2^128。跨边界用 global − outside 翻转记录。累积器使用模 2^256 算术。零流动性变动可收取已有仓位费用。',
        code: 'fee = mulDiv(insideNow - insideLast, oldLiquidity, 1 << 128);\n// 核心会返回 callerDelta 和单独的 feesAccrued。',
      },
    ],
    exercise: { title: '看清 crossing 对活跃流动性的影响', instruction: '两仓分别为 [−120, 60) 的 1,000,000 与 [60, 180) 的 400,000。改变当前 Tick 或跨界方向，比较活跃 L 和 liquidityNet 的符号。' },
    quiz: {
      question: '两个 NFT 在同一个池、相同上下界，核心仓位仍为何能区分？',
      choices: ['核心直接把每个 NFT 持有者作为 msg.sender', 'PositionManager 把不同 tokenId 转成不同 salt', '每个 NFT 自动连接到不同的 PoolId'],
      answer: 1, explanation: '核心看到相同的 PositionManager owner，tokenId 对应的 salt 让仓位键不同。',
      hint: '看 PositionManager._mint 写入 tokenId 后传给核心的字段。',
    },
    foundry: 'testLiquidity',
    practice: '对照 testLiquidityCrossingAndDistinctSalts，改动右侧仓位的流动性，先按 liquidityNet 预测 Tick 120 右侧的活跃 L，再修改对应断言。',
  },
  'pool-manager': {
    title: '从 PoolKey 走到 Slot0',
    summary: '检查初始化校验、PoolId 的编码、单例中的状态隔离，以及读取真实池状态的方法。',
    bridge: '刚才同一个 PoolManager 里有多个 ETH / USDC 池。调用进来以后，合约凭什么定位其中一个池，并找到它的价格和仓位？',
    invariant: 'currency0 和 currency1 必须按 uint160 数值严格升序。原生币是 address(0)。相同市场也可能因为 fee、tickSpacing 或 hooks 不同而产生不同 PoolId。',
    steps: [
      {
        label: '校验 PoolKey', location: 'PoolManager.initialize',
        source: core('PoolManager.sol#L117-L142'),
        explanation: '检查币种顺序、tickSpacing 范围和 Hook 地址权限的组合。初始化不改变币种余额，因此可在锁定状态调用。静态费率取校验后的字段，动态池初始 LP 费率为零，Hook 可以更新。',
        code: 'PoolKey({currency0: c0, currency1: c1,\n    fee: feeOrFlag, tickSpacing: spacing, hooks: hook});',
      },
      {
        label: '计算 PoolId', location: 'PoolIdLibrary.toId',
        source: core('types/PoolId.sol#L8-L16'),
        explanation: '五个静态 ABI 字占用 160 字节。实现直接对内存结构做 keccak256，等价于 abi.encode(key)。ABI 打包编码会改变输入字节长度，因此算不出相同的 ID。',
        code: 'PoolId id = PoolId.wrap(keccak256(abi.encode(key)));\n// 5 × 32 字节，包括 hooks 字段。',
      },
      {
        label: '初始化状态', location: 'Pool.initialize',
        source: core('libraries/Pool.sol#L100-L113'),
        explanation: 'sqrtPriceX96 是 token1/token0 原始单位比值平方根编码。由它计算初始 Tick，写入 Slot0；重复初始化同一 ID 会回滚，初始化本身并不提供流动性。',
        code: 'tick = TickMath.getTickAtSqrtPrice(sqrtPriceX96);\n// 初始 sqrtPriceX96 = 2 ** 96 对应原始单位 1:1。',
      },
      {
        label: '读取状态', location: 'StateLibrary.getSlot0',
        source: core('libraries/StateLibrary.sol#L40-L58'),
        explanation: 'Core 在单例内部用 PoolId 映射到 Pool.State。StateLibrary 用 extsload 读取并解包持久状态，TransientStateLibrary 用 exttload 观察当前交易内的临时余额。',
        code: '(uint160 price, int24 tick, uint24 protocolFee, uint24 lpFee) =\n    StateLibrary.getSlot0(manager, poolId);',
      },
    ],
    exercise: { title: '重新编码 PoolKey', instruction: '切换原生资产、Hook、动态费率和 Tick 间距。观察五个 ABI 字和真实 Keccak-256；无效配置也可以计算哈希，但无法初始化。' },
    quiz: {
      question: '费率、币种和 Hook 都相同，只修改 tickSpacing 会发生什么？',
      choices: ['PoolId 改变，目标是另一个池', 'PoolId 不变，只影响仓位可选范围', '必须使用 abi.encodePacked 才能区分'],
      answer: 0, explanation: 'tickSpacing 占 PoolKey 的一个 ABI 字，任何字段变化都会改变哈希输入。',
      hint: '试着把间距从 60 改成 10，对比浏览器显示的 PoolId。',
    },
    foundry: 'testPoolId',
    practice: '在 testPoolIdMatchesAbiEncodingAndIsolatesState 里逐次改变 fee 和 tickSpacing，检查 PoolId、Slot0 和活跃流动性是否仍独立。',
  },
  hooks: {
    title: '读懂 Hook 权限与返回 Delta',
    summary: '跟踪低 14 位权限、CREATE2 部署、selector 验证、beforeSwap 的指定币调整，以及 Hook 与调用者的独立记账。',
    bridge: '刚才打开或关闭回调，兑换顺序随之改变。真实的 PoolManager 怎样从 Hook 地址判断该调用谁，又怎样处理回调结果？',
    invariant: 'Hook 位掩码决定 PoolManager 调哪些回调。返回 Delta 的权限独立于基本回调；单次 LP 费率覆盖与 returns-delta 权限是不同判断。',
    steps: [
      {
        label: '核对地址', location: 'Hooks.isValidHookAddress',
        source: core('libraries/Hooks.sol#L27-L125'),
        explanation: '部署时常搜索 CREATE2 salt，使可预测地址低 14 位匹配预期权限。地址位负责调度。没有对应基本回调却打开返回 Delta 位，初始化会失败。Hook 的 sender 参数代表调用 PoolManager 的合约，通常不是原始用户。',
        code: 'uint160 flags = uint160(hookAddress) & 0x3fff;\n// beforeSwap = 0x80；afterSwap = 0x40。',
      },
      {
        label: '执行回调', location: 'Hooks.callHook / beforeSwap',
        source: core('libraries/Hooks.sol#L248-L283'),
        explanation: '核心检查返回的 selector。beforeSwap 的 96 字节返回依次包含 selector、BeforeSwapDelta 和费率覆盖值。只有正确权限允许指定币 Delta 改变核心交易量，修改后不能把 exact-in 和 exact-out 互换。',
        code: 'amountToSwap = params.amountSpecified + specifiedDelta;\n// BeforeSwapDelta 两个半字分别是 specified 与 unspecified。',
      },
      {
        label: '交换顺序', location: 'Hooks.afterSwap',
        source: core('libraries/Hooks.sol#L285-L313'),
        explanation: 'afterSwap 可返回未指定币上的 int128 调整。库先按 swap 方向和精确输入/输出确定指定币对应 currency0 或 currency1，再将两个调整组装成 Hook 的 BalanceDelta。',
        code: 'bool specifiedIsCurrency0 = (params.amountSpecified < 0) == params.zeroForOne;\n// 按指定币方向把 Delta 排列成 currency0 / currency1。',
      },
      {
        label: '记入两方', location: 'PoolManager.swap',
        source: core('PoolManager.sol#L222-L229'),
        explanation: 'Hook delta 从核心结果中扣除后成为调用者的结果。随后 PoolManager 分别记到账户 address(hooks) 与 msg.sender。两者的未结余额按各自账户结清。',
        code: 'callerDelta = poolDelta - hookDelta;\n// 对 Hook 和调用者分别记账。',
      },
    ],
    exercise: { title: '拼接 Hook 权限位', instruction: '分别切换回调位和返回 Delta 位，检查低位十六进制掩码，以及在已有 Hook 权限的前提下配置是否通过。' },
    quiz: {
      question: '要让 beforeSwap 修改核心 amountSpecified，需要哪些地址位？',
      choices: ['仅 BEFORE_SWAP_FLAG', 'BEFORE_SWAP_FLAG 与 BEFORE_SWAP_RETURNS_DELTA_FLAG', '仅 AFTER_SWAP_RETURNS_DELTA_FLAG'],
      answer: 1, explanation: '基本回调位触发执行，返回 Delta 权限让核心使用回调的指定币调整值。',
      hint: '保留 beforeSwap 返回 Delta，关闭 beforeSwap，观察权限组合。',
    },
    foundry: 'testHook',
    practice: '看 testHookRejectsReturnFlagWithoutCallbackFlag 的 revert selector。把地址低位从 0x08 改为 0x88，再解释为什么初始化通过，且尚未执行 beforeSwap。',
  },
  fees: {
    title: '跟踪 LP Fee 覆盖与协议费',
    summary: '区分 PoolKey 的动态标志、Slot0 的当前 LP 费率、回调的覆盖标志，以及 swap 对费用的拆分和计提。',
    bridge: '刚才同一笔交易在两个池的费率不同。实际 Swap 会从哪里读费率，单次覆盖又会不会改掉池里的费率？',
    invariant: '所有费率按 pips（百万分之一）计。0x800000 是 PoolKey 的动态费率标志，0x400000 是 beforeSwap 返回值的覆盖标志。',
    steps: [
      {
        label: '声明动态池', location: 'LPFeeLibrary.getInitialLPFee',
        source: core('libraries/LPFeeLibrary.sol#L13-L48'),
        explanation: '动态模式用单一标志值编码在 PoolKey 里。实际动态费存放在 Slot0，初始为零。静态费率值校验至 1,000,000 pips。',
        code: 'uint24 poolKeyFee = 0x800000;\nuint24 currentLPFee = 3_000; // 0.30%',
      },
      {
        label: '覆盖或持久化', location: 'PoolManager.updateDynamicLPFee / Hooks.beforeSwap',
        source: core('PoolManager.sol#L337-L346'),
        explanation: '只有该动态池绑定的 Hook 能更新存储费率。beforeSwap 也能交还带覆盖位的本次费率，核心剥离覆盖位后再验证范围。静态池不采用该覆盖。',
        code: 'manager.updateDynamicLPFee(key, 3_000); // 由绑定的 Hook 调用\nuint24 forThisSwap = uint24(0x400000 | 12_000);',
      },
      {
        label: '合成总费', location: 'ProtocolFeeLibrary.calculateSwapFee',
        source: core('libraries/ProtocolFeeLibrary.sol#L27-L47'),
        explanation: '协议费跟交易方向关联。总费逻辑是先从输入收协议费，再对余下部分收 LP 费，计算采用整数 pips。总费达到 100% 时，核心拒绝 exact output。',
        code: 'swapFee = protocolFee + lpFee - protocolFee * lpFee / 1_000_000;\n// 两项并非直接相加。',
      },
      {
        label: '拆分计提', location: 'Pool.swap 的步进费用',
        source: core('libraries/Pool.sol#L391-L416'),
        explanation: '每一步从总手续费剥离协议份额。其余累加到输入币的 feeGrowthGlobalX128；流动性为零时跳过除法。费用增长要结合每次 Tick crossing 和仓位费用检查点理解。',
        code: 'feeGrowthGlobalX128 += lpFeeAmount * (1 << 128) / activeLiquidity;\n// 币种由 zeroForOne 确定。',
      },
    ],
    exercise: { title: '比较本次有效 LP 费和总费', instruction: '变更动态模式、覆盖标志及两个费率，观察其落在哪一条分支。试着设置 100% 覆盖并检查 exact output 的条件。' },
    quiz: {
      question: '动态池的 beforeSwap 返回 0x400000 | 12000。下一笔没有覆盖时，用哪个 LP 费率？',
      choices: ['12000，覆盖已修改池的 Slot0', '0x400000，去掉后面的费率数值', 'Slot0 中当前存储的 LP 费率'],
      answer: 2, explanation: '单次覆盖作用域是当前 Swap。更新 Slot0 需要绑定 Hook 调用 updateDynamicLPFee。',
      hint: '看浏览器里的「当前存储 LP 费」在切换覆盖时是否变化。',
    },
    foundry: 'testFee',
    practice: '把 testFeeOverrideIsLocalToOneSwap 中的覆盖值改为 3,000，比较同起始状态两个池的输出。观察交易后存储费率一直由 Hook 持久更新决定。',
  },
  settlement: {
    title: '跟踪 unlock 回调与临时账本',
    summary: '从外围的动作分发进入 PoolManager，检查账户与币种索引、ERC-20 结算顺序、原生币和未结余额回滚。',
    bridge: '刚才两跳兑换抵消了中间币。合约怎样给每个账户记账，为什么替另一个地址付款仍然无法结算？',
    invariant: 'unlock 结束前，任何参与账户的任何币种净额都必须归零。正数是可领取额，负数是该账户应付；不同账户的余额不会自动抵消。',
    steps: [
      {
        label: '回调入口', location: 'BaseActionsRouter._executeActions → PoolManager.unlock',
        source: periphery('base/BaseActionsRouter.sol#L23-L49'),
        explanation: '外围将 actions 和 params 编码交给 unlock。Manager 回调 unlock 的实际调用者，SafeCallback 验证来路，BaseActionsRouter 按下标分发。例如 exact input 单池动作 0x06 后可连接 SETTLE_ALL 0x0c 和 TAKE_ALL 0x0f。',
        code: 'bytes memory actions = hex"060c0f";\n// params[i] 分别编码 swap、币种与最大输入、币种与最小输出。',
      },
      {
        label: '写入 Delta', location: 'CurrencyDelta.applyDelta',
        source: core('libraries/CurrencyDelta.sol#L8-L42'),
        explanation: 'EIP-1153 临时存储以 target 与 currency 得到 key，两跳中同一 caller 的中间币净额可以抵消。_accountDelta 在从零到非零或非零到零时更新 NonzeroDeltaCount。',
        code: 'key = keccak256(abi.encode(target, currency));\n// tstore(key, previous + change)',
      },
      {
        label: '付款与领取', location: 'PoolManager.sync / settle / take',
        source: core('PoolManager.sol#L279-L308'),
        explanation: 'ERC-20 先 sync 记录池余额，再转账并 settle，用实收差额记账。原生币通常先用 sync(address(0)) 清除先前币种检查点，再传 msg.value。take 向指定地址转资产，同时减少调用者的正 Delta。',
        code: 'manager.sync(currencyIn);\ntoken.transfer(address(manager), amountIn);\nmanager.settle();\nmanager.take(currencyOut, recipient, amountOut);',
      },
      {
        label: '退出并检查', location: 'PoolManager.unlock',
        source: core('PoolManager.sol#L104-L114'),
        explanation: '回调返回后检查 NonzeroDeltaCount。任何剩余值都会触发 CurrencyNotSettled 并回滚，验证的是所有账户的临时账本；ERC-6909 mint / burn 也能用来处理合适的余额。',
        code: 'if (nonzeroDeltaCount != 0) revert CurrencyNotSettled();\n// 校验通过，重新锁定。',
      },
    ],
    exercise: { title: '追踪两跳和退出时的非零计数', instruction: '依次执行两跳兑换。切换结算动作，观察中间币何时归零，以及漏付、漏领和替错误的账户付款的不同结果。' },
    quiz: {
      question: '路由器欠 100 A，另一账户拥有 +100 A，回调能直接返回吗？',
      choices: ['可以，同币种的全局和为零即可', '可以，Manager 会自动合并两个账户', '不可以，两个地址各有一个非零条目'],
      answer: 2, explanation: '余额按账户和币种索引。全局金额相等也不能替代每个条目归零。',
      hint: '选择「替别的账户付款」，查看退出检查计数。',
    },
    foundry: 'testSettlement',
    practice: '运行 testSettlementRollsBackAllIncompleteVariants，比较漏付、漏领和 settleFor 错账户的 trace。找到 count 在两次 swap 后、结算后各自是多少。',
  },
}
