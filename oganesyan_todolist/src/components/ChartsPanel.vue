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
  const buckets = [0]
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

    if (dlTs < nowTs) {
      buckets[0]++
    } else {
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
  if (total.value === 0) return { done: 0, active: 0, overdue: 0 }
  return {
    done: Math.round((counts.value.done / total.value) * 100),
    active: Math.round((counts.value.active / total.value) * 100),
    overdue: Math.round((counts.value.overdue / total.value) * 100)
  }
})

function destroyIfExists(chartInstance) {
  if (chartInstance && typeof chartInstance.destroy === 'function') {
    chartInstance.destroy()
  }
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
        backgroundColor: data.buckets.map((v, i) => i === 0 ? '#ff4141' : 'rgb(41,185,66)')
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          bodyFont: {
            family: "'Guidy', sans-serif",
            size: 14
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#dcd6f7',
            font: {
              family: "'Guidy', sans-serif",
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#dcd6f7',
            stepSize: 1,
            font: {
              family: "'Guidy', sans-serif",
              size: 12
            }
          }
        }
      }
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
        backgroundColor: ['#29b942', '#80abff', '#ff4141'],
        hoverOffset: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: {
            family: "'Guidy', sans-serif",
            size: 14
          }
        }
      },
      cutout: '70%'
    }
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
      <div class="bar-chart-container">
        <canvas ref="barCanvas"></canvas>
      </div>
    </div>
    <div class="chart-card">
      <h3>Статусы задач</h3>
      <div class="donut-chart-container">
        <canvas ref="donutCanvas"></canvas>
      </div>
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
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}

.chart-card {
  background: linear-gradient(180deg, #14271f, #173729);
  padding: 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  color: #e6e0ff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-family: 'Guidy', sans-serif;
  font-size: 1.3rem;
}

.bar-chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}

.donut-chart-container {
  position: relative;
  height: 250px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.legend {
  margin: 12px 0 0 0;
  padding: 0;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d6cff8;
  font-family: 'Guidy', sans-serif;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot.done {
  background: #29b942;
}

.dot.active {
  background: #80abff;
}

.dot.overdue {
  background: #ff4141;
}
</style>
