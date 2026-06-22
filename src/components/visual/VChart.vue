<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, MarkLineComponent, CanvasRenderer])
const props = defineProps<{ option: any; height?: string }>()
const el = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
onMounted(() => { if (el.value) { chart = echarts.init(el.value); chart.setOption(props.option) } })
watch(() => props.option, (o) => chart?.setOption(o, true), { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>
<template><div ref="el" :style="{ width: '100%', height: height ?? '320px' }" /></template>
