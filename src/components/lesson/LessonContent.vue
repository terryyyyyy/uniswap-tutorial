<script setup lang="ts">
import type { Lesson } from '@/types'
import MdRenderer from '@/components/markdown/MdRenderer.vue'
import VisualEmbed from '@/components/markdown/VisualEmbed.vue'

defineProps<{ lesson: Lesson }>()
</script>

<template>
  <div class="lesson-content">
    <div class="text"><MdRenderer :content="lesson.content" /></div>
    <div class="visual">
      <VisualEmbed v-for="v in lesson.visuals" :key="v" :type="v" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.lesson-content { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
@media (max-width: 1024px) { .lesson-content { grid-template-columns: 1fr; } }
</style>
