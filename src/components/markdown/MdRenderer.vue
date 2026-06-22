<script setup lang="ts">
import { computed, ref, onMounted, nextTick, createApp } from 'vue'
import { createMarkdown } from '@/markdown/plugins'
import CodeRef from './CodeRef.vue'

const props = defineProps<{ content: string }>()
const md = createMarkdown()
const html = computed(() => md.render(props.content))
const containerRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return
  containerRef.value.querySelectorAll<HTMLElement>('.code-ref-slot').forEach((el) => {
    const id = el.getAttribute('data-snippet') || ''
    el.innerHTML = ''
    createApp(CodeRef, { snippetId: id }).mount(el)
  })
})
</script>

<template>
  <div class="md-body" ref="containerRef" v-html="html" />
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.md-body {
  color: $text-primary;
  line-height: 1.7;
  font-size: 15px;
  :deep(h1), :deep(h2), :deep(h3) { color: $accent-cyan; margin: 18px 0 10px; }
  :deep(p) { margin: 10px 0; }
  :deep(code) { background: $bg-elevated; padding: 2px 6px; border-radius: 4px; font-family: $code-font; }
  :deep(.hljs) { background: $bg-deep; border: 1px solid $border; border-radius: 6px; padding: 12px; overflow-x: auto; font-family: $code-font; font-size: 13px; }
  :deep(.md-tip) { background: rgba(45, 212, 191, .1); border-left: 3px solid $accent-cyan; padding: 10px 14px; border-radius: 4px; margin: 12px 0; }
  :deep(.md-warning) { background: rgba(245, 158, 11, .1); border-left: 3px solid $accent-orange; padding: 10px 14px; border-radius: 4px; margin: 12px 0; }
  :deep(.md-visual-hint) { color: $text-secondary; font-size: 13px; font-style: italic; margin: 8px 0; }
  :deep(table) { border-collapse: collapse; th, td { border: 1px solid $border; padding: 6px 10px; } }
}
</style>
