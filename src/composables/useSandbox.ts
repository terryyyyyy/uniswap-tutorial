import { useSandboxStore } from '@/stores/sandbox'
import { storeToRefs } from 'pinia'

export function useSandbox() {
  const s = useSandboxStore()
  const { code, result, running, hintsUsed, lastSuccess } = storeToRefs(s)
  return {
    code, result, running, hintsUsed, lastSuccess,
    setCode: s.setCode,
    run: s.run,
    useHint: s.useHint,
    reset: s.reset,
  }
}
