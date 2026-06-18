import { describe, it, expect } from 'vitest'
import { position, nextInitializedTickWithinOneWord, flipInitialized, type BitmapState } from '@/simulations/tickBitmap'

describe('TickBitmap', () => {
  it('position: 256 tick/word', () => {
    const p = position(0, 60); expect(p.wordPos).toBe(0); expect(p.bitPos).toBe(0)
    const p2 = position(60 * 256, 60); expect(p2.wordPos).toBe(1); expect(p2.bitPos).toBe(0)
    const p3 = position(60 * 100, 60); expect(p3.wordPos).toBe(0); expect(p3.bitPos).toBe(100)
  })
  it('flip + nextInitialized lte 找到同 word 内远 tick（>32 间距）', () => {
    let bm: BitmapState = {}
    bm = flipInitialized(bm, 60, 60)
    bm = flipInitialized(bm, 60 * 100, 60)
    const r = nextInitializedTickWithinOneWord(bm, 60 * 100, 60, true)
    expect(r.initialized).toBe(true)
    expect(r.next).toBe(60 * 100)
  })
  it('nextInitialized gt 找到下一个', () => {
    let bm: BitmapState = {}
    bm = flipInitialized(bm, 60 * 100, 60)
    const r = nextInitializedTickWithinOneWord(bm, 0, 60, false)
    expect(r.next).toBe(60 * 100); expect(r.initialized).toBe(true)
  })
  it('nextInitialized gt 从 compressed+1 起（不含当前 tick）', () => {
    let bm: BitmapState = {}
    bm = flipInitialized(bm, 60, 60)       // tick 60, bitPos 1
    bm = flipInitialized(bm, 60 * 100, 60) // tick 6000, bitPos 100
    // 从 tick 60 向右找，不应返回 60 自身，应返回 6000
    const r = nextInitializedTickWithinOneWord(bm, 60, 60, false)
    expect(r.next).toBe(60 * 100)
  })
})
