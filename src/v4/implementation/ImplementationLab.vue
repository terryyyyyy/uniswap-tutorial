<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LessonId } from '../course'
import FlowStepper from '../labs/FlowStepper.vue'
import { effectiveFee, liquidityAt, maxFee, overrideFlag, poolIdentity, sampleSwapStep, settlementStages, swapHookFlags } from './model'

defineProps<{ id: LessonId }>()

const native = ref(false)
const useHook = ref(false)
const dynamic = ref(false)
const spacing = ref(60)
const key = computed(() => poolIdentity(native.value, useHook.value, dynamic.value, spacing.value))

const amount = ref(5_000)
const exactOut = ref(false)
const zeroForOne = ref(true)
const nearLimit = ref(false)
const specified = computed(() => BigInt(amount.value) * (exactOut.value ? 1n : -1n))
const swap = computed(() => sampleSwapStep(specified.value, zeroForOne.value, nearLimit.value))
const stopLabels = { amount: '耗尽本步额度', limit: '到达价格限制', tick: '到达下一个 Tick 边界' }

const tick = ref(0)
const moveLeft = ref(false)
const activeLiquidity = computed(() => liquidityAt(tick.value))

const before = ref(true)
const beforeDelta = ref(false)
const after = ref(false)
const afterDelta = ref(false)
const flags = computed(() => swapHookFlags(before.value, beforeDelta.value, after.value, afterDelta.value))
const maskHex = (value: number) => '0x' + value.toString(16).padStart(4, '0')

const feeOverride = ref(true)
const overridePips = ref(12_000)
const protocolFee = ref(1_000)
const fee = computed(() => effectiveFee(dynamic.value, feeOverride.value, 3000, overridePips.value, protocolFee.value))

const step = ref(0)
const settlement = ref('normal')
const ledger = computed(() => {
  const final = step.value === settlementStages.length - 1
  const deltas = final && settlement.value !== 'normal'
    ? [settlement.value === 'skip-take' ? 0 : -100, 0, settlement.value === 'skip-take' ? 90 : 0]
    : settlementStages[step.value]!.deltas
  const other = final && settlement.value === 'wrong-account' ? 100 : 0
  return { deltas, other, count: deltas.filter(value => value !== 0).length + Number(other !== 0) }
})
</script>

<template>
  <div class="lab-box dev-lab">
    <template v-if="id === 'pool-manager'">
      <div class="toggle-row" role="group" aria-label="PoolKey 字段">
        <label><input v-model="native" type="checkbox" /> 原生币 currency0</label>
        <label><input v-model="useHook" type="checkbox" /> Hook · beforeSwap</label>
        <label><input v-model="dynamic" type="checkbox" /> 动态费率标志</label>
        <label>Tick 间距
          <select v-model.number="spacing"><option :value="1">1</option><option :value="10">10</option><option :value="60">60</option><option :value="200">200</option></select>
        </label>
      </div>
      <div class="dev-output">
        <span>PoolId</span>
        <output>{{ key.id }}</output>
      </div>
      <p v-if="!key.validHook" class="lab-result is-warning" role="status">动态池必须配置非零 Hook 地址，此 PoolKey 无法初始化。</p>
      <details class="dev-words">
        <summary>查看 abi.encode 的五个字</summary>
        <dl v-for="(name, i) in ['currency0', 'currency1', 'fee', 'tickSpacing', 'hooks']" :key="name">
          <dt>{{ name }}</dt><dd>0x{{ key.words[i] }}</dd>
        </dl>
      </details>
    </template>

    <template v-else-if="id === 'swap'">
      <div class="toggle-row" role="group" aria-label="SwapParams">
        <label><input v-model="exactOut" type="checkbox" /> Exact output</label>
        <label><input v-model="zeroForOne" type="checkbox" /> zeroForOne</label>
        <label><input v-model="nearLimit" type="checkbox" /> 近端价格限制</label>
      </div>
      <div class="control-heading"><label for="specified">指定数量（最小单位）</label><output>{{ specified }}</output></div>
      <input id="specified" v-model.number="amount" type="range" class="lab-range" min="100" max="25000" step="100" />
      <dl class="metrics dev-metrics">
        <div><dt>amountIn / amountOut</dt><dd>{{ swap.amountIn }} / {{ swap.amountOut }}</dd></div>
        <div><dt>feeAmount</dt><dd>{{ swap.feeAmount }}</dd></div>
        <div><dt>BalanceDelta (0, 1)</dt><dd>{{ swap.delta0 }}, {{ swap.delta1 }}</dd></div>
        <div><dt>amountSpecifiedRemaining</dt><dd>{{ swap.remaining }}</dd></div>
        <div><dt>sqrtPriceTargetX96</dt><dd>{{ swap.target }}</dd></div>
        <div><dt>sqrtPriceNextX96</dt><dd>{{ swap.next }}</dd></div>
        <div><dt>本步结果</dt><dd class="accent-text">{{ stopLabels[swap.stop] }}</dd></div>
      </dl>
    </template>

    <template v-else-if="id === 'liquidity'">
      <div class="control-heading"><label for="active-tick">当前 Tick</label><output>{{ tick }}</output></div>
      <input id="active-tick" v-model.number="tick" type="range" class="lab-range" min="-180" max="240" step="1" />
      <div class="range-labels"><span>−180</span><span>60 · 共享边界</span><span>240</span></div>
      <div class="dev-ticks" aria-hidden="true">
        <span :class="{ 'range-on': activeLiquidity === 1_000_000 }"></span>
        <span :class="{ 'range-on': activeLiquidity === 400_000 }"></span>
        <i :style="{ left: ((tick + 180) / 420 * 100) + '%' }"></i>
      </div>
      <div class="toggle-row"><label><input v-model="moveLeft" type="checkbox" /> 以 zeroForOne 向左穿过 Tick 60</label></div>
      <dl class="metrics dev-metrics">
        <div><dt>当前区间活跃 L</dt><dd>{{ activeLiquidity.toLocaleString('en-US') }}</dd></div>
        <div><dt>Tick 60 的 liquidityGross</dt><dd>1,400,000</dd></div>
        <div><dt>Tick 60 存储的 liquidityNet</dt><dd>−600,000</dd></div>
        <div><dt>跨界时实际应用的 ΔL</dt><dd class="accent-text">{{ moveLeft ? '+600,000' : '−600,000' }}</dd></div>
      </dl>
    </template>

    <template v-else-if="id === 'hooks'">
      <div class="toggle-row" role="group" aria-label="Hook 地址权限">
        <label><input v-model="before" type="checkbox" /> beforeSwap · bit 7</label>
        <label><input v-model="beforeDelta" type="checkbox" /> beforeSwap 返回 Delta · bit 3</label>
        <label><input v-model="after" type="checkbox" /> afterSwap · bit 6</label>
        <label><input v-model="afterDelta" type="checkbox" /> afterSwap 返回 Delta · bit 2</label>
      </div>
      <div class="dev-output">
        <span>swap 相关的低位掩码</span>
        <output>{{ maskHex(flags.mask) }} · {{ flags.mask.toString(2).padStart(14, '0') }}</output>
      </div>
      <p class="lab-result" :class="flags.valid ? 'is-positive' : 'is-warning'" role="status">
        {{ !flags.valid ? '组合无效。返回 Delta 位需要对应的基本回调位。' : flags.mask === 0 ? '两种 Swap 回调都不调度。地址整体是否合法还取决于其他权限或动态费率模式。' : '组合有效。PoolManager 只调度已开启的回调，并验证 selector。' }}
      </p>
    </template>

    <template v-else-if="id === 'fees'">
      <div class="toggle-row" role="group" aria-label="费率模式">
        <label><input v-model="dynamic" type="checkbox" /> 动态池</label>
        <label><input v-model="feeOverride" type="checkbox" /> 设置覆盖标志 0x400000</label>
      </div>
      <div class="control-heading"><label for="proposed-fee">beforeSwap 返回的费率字段</label><output>{{ overridePips }} pips</output></div>
      <input id="proposed-fee" v-model.number="overridePips" type="range" class="lab-range" min="0" :max="maxFee" step="1000" />
      <div class="control-heading"><label for="protocol-fee">交易方向的协议费率</label><output>{{ protocolFee }} pips</output></div>
      <input id="protocol-fee" v-model.number="protocolFee" type="range" class="lab-range" min="0" max="1000" step="25" />
      <dl class="metrics dev-metrics">
        <div><dt>当前存储 LP 费</dt><dd>3000 pips</dd></div>
        <div><dt>返回的 uint24</dt><dd>0x{{ (overridePips | (feeOverride ? overrideFlag : 0)).toString(16).padStart(6, '0') }}</dd></div>
        <div><dt>本次有效 LP 费 / 总费</dt><dd class="accent-text">{{ fee.fee }} / {{ fee.total }} pips</dd></div>
        <div><dt>Exact output 费率检查</dt><dd :class="fee.total === maxFee ? 'is-warning' : ''">{{ fee.total === maxFee ? 'InvalidFeeForExactOut' : '通过' }}</dd></div>
      </dl>
    </template>

    <template v-else>
      <div class="toggle-row">
        <label>退出前的结算方式
          <select v-model="settlement">
            <option value="normal">正常结算</option>
            <option value="skip-pay">漏付 A</option>
            <option value="skip-take">漏领 C</option>
            <option value="wrong-account">替别的账户付款</option>
          </select>
        </label>
      </div>
      <FlowStepper v-model="step" :steps="settlementStages">
        <strong>NonzeroDeltaCount = {{ ledger.count }}</strong>
        <p v-if="step === 3 && ledger.count > 0" class="is-warning">CurrencyNotSettled，回调内的状态和转账全部回滚。</p>
        <p v-else-if="step === 3">余额全部归零，Manager 重新锁定。</p>
        <p v-else-if="step === 2">Router 的两笔 B 余额抵消，现在应付 A 并应收 C。</p>
        <p v-else>以下余额按账户与币种计入当前交易的临时存储。</p>
      </FlowStepper>
      <div class="ledger">
        <p>Router 账户</p>
        <dl>
          <div v-for="(value, i) in ledger.deltas" :key="i">
            <dt>{{ ['A', 'B', 'C'][i] }}</dt>
            <dd :key="value" :class="value > 0 ? 'is-positive' : value < 0 ? 'is-warning' : ''">{{ value > 0 ? '+' : '' }}{{ value }}</dd>
          </div>
        </dl>
        <p v-if="ledger.other" class="is-warning">另一账户 A 余额 +{{ ledger.other }}</p>
      </div>
    </template>
  </div>
</template>
