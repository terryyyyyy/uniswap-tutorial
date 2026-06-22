<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js'
import { SNIPPETS } from '@/data/source/snippets'

const props = defineProps<{ snippetId: string }>()
const snippet = computed(() => SNIPPETS[props.snippetId])
const highlighted = computed(() =>
  snippet.value ? hljs.highlight(snippet.value.code, { language: snippet.value.lang }).value : '',
)
</script>

<template>
  <div class="code-ref" v-if="snippet">
    <div class="meta">{{ snippet.file }}:{{ snippet.lines[0] }}-{{ snippet.lines[1] }}</div>
    <pre class="hljs"><code v-html="highlighted" /></pre>
  </div>
  <div v-else class="missing">[源码片段 {{ snippetId }} 待补全]</div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.code-ref { margin: 12px 0; }
.meta { font-size: 12px; color: $text-secondary; font-family: $code-font; margin-bottom: 4px; }
.hljs { background: $bg-deep; border: 1px solid $border; border-radius: 6px; padding: 12px; overflow-x: auto; font-family: $code-font; font-size: 13px; }
.missing { color: $danger; font-size: 12px; font-style: italic; }
</style>
