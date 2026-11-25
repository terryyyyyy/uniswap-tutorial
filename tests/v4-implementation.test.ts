import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { lessons } from '@/v4/course'
import { implementation } from '@/v4/implementation/course'
import { effectiveFee, liquidityAt, poolIdentity, sampleSwapStep, swapHookFlags } from '@/v4/implementation/model'
import { useCourseProgress } from '@/v4/progress'

describe('v4 implementation lessons', () => {
  it('pairs every existing topic with source steps and a matching Foundry command', () => {
    expect(Object.keys(implementation).sort()).toEqual(lessons.map(({ id }) => id).sort())
    for (const lesson of Object.values(implementation)) {
      expect(lesson.steps).toHaveLength(4)
      expect(lesson.foundry).toMatch(/^test[A-Z]/)
      expect(lesson.steps.every(({ source }) => /\/blob\/[\da-f]{40}\/src\/.+\.sol#L\d+-L\d+$/.test(source))).toBe(true)
    }
  })

  it('resumes at the implementation in the same lesson after the application quiz', () => {
    setActivePinia(createPinia())
    const progress = useCourseProgress()
    progress.$patch({ completed: ['swap'], lastLesson: 'swap' })

    expect(progress.resumeTarget).toEqual({ id: 'swap', hash: '#implementation' })
    expect(progress.completedTopics).toEqual([])
    progress.visit('swap')
    progress.complete('swap', 'implementation')
    expect(progress.completedTopics).toEqual(['swap'])
    expect(progress.resumeTarget).toEqual({ id: 'liquidity', hash: '' })
  })

  it('preserves legacy implementation progress and picks up the missing application section', () => {
    setActivePinia(createPinia())
    const progress = useCourseProgress()
    progress.$patch({ completed: ['swap'], implementationCompleted: ['swap', 'pool-manager'], lastLesson: 'swap', lastImplementationLesson: 'pool-manager' })

    expect(progress.completedTopics).toEqual(['swap'])
    expect(progress.resumeTarget).toEqual({ id: 'pool-manager', hash: '' })
    progress.visit('hooks')
    expect(progress.resumeTarget).toEqual({ id: 'hooks', hash: '' })
  })

  it('matches the ABI-encoded PoolKey independently hashed with cast', () => {
    const base = poolIdentity(false, false, false, 60)
    expect(base.id).toBe('0xf6a117501d7c06f988e5cb96441dff2b3bc20bc7c52bc943e66da6e63b93c97c')
    expect(base.words.every(word => word.length === 64)).toBe(true)
    expect(poolIdentity(false, false, false, 10).id).not.toBe(base.id)
    expect(poolIdentity(false, false, true, 60).validHook).toBe(false)
  })

  it('agrees with the Solidity swap-step fixtures and retains unused input at a limit', () => {
    expect(sampleSwapStep(-5_000n, true, false)).toMatchObject({
      amountIn: 4985n, amountOut: 4960n, feeAmount: 15n, delta0: -5000n, delta1: 4960n, remaining: 0n,
    })
    expect(sampleSwapStep(5_000n, true, false)).toMatchObject({
      amountIn: 5026n, amountOut: 5000n, feeAmount: 16n, delta0: -5042n, delta1: 5000n,
    })
    const limited = sampleSwapStep(-25_000n, false, true)
    expect(limited.stop).toBe('limit')
    expect(limited.remaining).toBeLessThan(0n)
    expect(limited.delta0).toBeGreaterThan(0n)
    expect(limited.delta1).toBeLessThan(0n)
  })

  it('applies half-open Tick intervals and requires the callback bit for returned deltas', () => {
    expect(liquidityAt(59)).toBe(1_000_000)
    expect(liquidityAt(60)).toBe(400_000)
    expect(liquidityAt(180)).toBe(0)
    expect(swapHookFlags(false, true, true, true)).toEqual({ mask: 0x4c, valid: false })
    expect(swapHookFlags(true, true, true, true)).toEqual({ mask: 0xcc, valid: true })
  })

  it('honors the override only for dynamic pools and uses the protocol fee composition formula', () => {
    expect(effectiveFee(false, true, 3000, 12000, 1000)).toEqual({ fee: 3000, total: 3997 })
    expect(effectiveFee(true, true, 3000, 12000, 1000)).toEqual({ fee: 12000, total: 12988 })
    expect(effectiveFee(true, false, 3000, 12000, 1000).fee).toBe(3000)
    expect(effectiveFee(true, true, 3000, 1_000_000, 1000).total).toBe(1_000_000)
  })
})
