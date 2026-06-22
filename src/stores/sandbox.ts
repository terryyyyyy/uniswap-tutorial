import { defineStore } from 'pinia'
import type { SandboxResult } from '@/types/simulation'

export const useSandboxStore = defineStore('sandbox', {
  state: () => ({
    code: '' as string,
    result: null as SandboxResult | null,
    running: false,
    hintsUsed: 0,
    lastSuccess: false,
  }),
  actions: {
    setCode(c: string) { this.code = c },
    async run(entry: string) {
      this.running = true
      const { runSandbox } = await import('@/sandbox/runner')
      const res = await runSandbox(this.code, entry)
      this.result = res
      this.lastSuccess = res.success
      this.running = false
    },
    useHint() { this.hintsUsed++ },
    reset() {
      this.code = ''
      this.result = null
      this.hintsUsed = 0
      this.lastSuccess = false
    },
  },
})
