<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useTodos } from '../composables/useTodos.js'

Chart.register(...registerables)

const { tasks } = useTodos()

const barCanvas = ref(null)
const donutCanvas = ref(null)

let barChart = null
let donutChart = null

function fmtDateKey(d) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

function prepareDeadlineBuckets() {
  const now = new Date()
  const buckets = [0]  // 0 — просроченные
  const labels = ['Просроч.']

  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    labels.push(fmtDateKey(d))
    buckets.push(0)
  }

  const nowTs = Date.now()
  for (const t of tasks.value) {
    if (!t.deadline || t.completed) continue
    const dl = new Date(t.deadline)
    if (isNaN(dl)) continue
    const dlTs = dl.getTime()

    if (dlTs < nowTs) buckets[0]++
    else {
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() + i)
        if (fmtDateKey(d) === fmtDateKey(dl)) {
          buckets[i + 1]++
          break
        }
      }
    }
  }

  return { labels, buckets }
}

const counts = computed(() => {
  const nowTs = Date.now()
  let done = 0, active = 0, overdue = 0
  for (const t of tasks.value) {
    if (t.completed) done++
    else if (t.deadline && new Date(t.deadline).getTime() < nowTs) overdue++
    else active++
  }
  return { done, active, overdue }
})

const total = computed(() => counts.value.done + counts.value.active + counts.value.overdue)
const perc = computed(() => {
  if (total.value === 0) return { done:0, active:0, overdue:0 }
  return {
    done: Math.round((counts.value.done / total.value) * 100),
    active: Math.round((counts.value.active / total.value) * 100),
    overdue: Math.round((counts.value.overdue / total.value) * 100)
  }
})

function destroyIfExists(chartInstance) {
  if (chartInstance && typeof chartInstance.destroy === 'function') chartInstance.destroy()
}

function renderBar() {
  if (!barCanvas.value) return
  destroyIfExists(barChart)
  const ctx = barCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, barCanvas.value.width, barCanvas.value.height)

  const data = prepareDeadlineBuckets()
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Кол-во',
        data: data.buckets,
        borderRadius: 8,
        barThickness: 18,
        backgroundColor: data.buckets.map((v, i) => i === 0 ? '#ff6b6b' : 'rgba(124,92,255,0.95)')
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#dcd6f7' } },
        y: { beginAtZero: true, ticks: { color: '#dcd6f7', stepSize: 1 } }
      },
      maintainAspectRatio: false
    }
  })
}

function renderDonut() {
  if (!donutCanvas.value) return
  destroyIfExists(donutChart)
  const ctx = donutCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, donutCanvas.value.width, donutCanvas.value.height)

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Выполнено', 'Активные', 'Просрочено'],
      datasets: [{
        data: [counts.value.done, counts.value.active, counts.value.overdue],
        backgroundColor: ['#7c5cff', '#c9bdf7', '#ff6b6b'],
        hoverOffset: 6
      }]
    },
    options: { plugins: { legend: { display: false } }, cutout: '60%', maintainAspectRatio: false }
  })
}

onMounted(async () => {
  await nextTick()
  renderBar()
  renderDonut()
})

watch(tasks, async () => {
  await nextTick()
  renderBar()
  renderDonut()
}, { deep: true })
</script>

<template>
  <section class="charts-panel">
    <div class="chart-card">
      <h3>Дедлайны (ближайшие 7 дней)</h3>
      <canvas ref="barCanvas"></canvas>
    </div>

    <div class="chart-card">
      <h3>Статусы задач</h3>
      <canvas ref="donutCanvas"></canvas>

      <ul class="legend">
        <li><span class="dot done"></span> Выполнено — {{ counts.done }} ({{ perc.done }}%)</li>
        <li><span class="dot active"></span> Активные — {{ counts.active }} ({{ perc.active }}%)</li>
        <li><span class="dot overdue"></span> Просрочено — {{ counts.overdue }} ({{ perc.overdue }}%)</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.charts-panel {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 16px;
  margin-bottom: 18px;
}

.chart-card {
  background: linear-gradient(180deg,#171427,#201737);
  padding: 18px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: #e6e0ff;
  box-shadow: 0 6px 20px rgba(0,0,0,0.45);
}

.chart-card canvas {
  width: 100% !important;
  height: 160px !important;
  margin-bottom: 8px;
}

.legend {
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend li { display:flex; align-items:center; gap:8px; color:#d6cff8 }
.dot { width:12px;height:12px;border-radius:50%;display:inline-block }
.dot.done { background: #7c5cff }
.dot.active { background: #c9bdf7 }
.dot.overdue { background: #ff6b6b }
</style>
