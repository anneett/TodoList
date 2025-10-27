<script setup>
import { ref, computed, watch } from 'vue'
import { useTodos } from "../composables/useTodos.js"

const props = defineProps({
  modelValue: { type: String, default: 'all' }
})

const emit = defineEmits(["update:filter"])

const activeTab = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  activeTab.value = newVal
})

function setActiveTab(key) {
  activeTab.value = key
  emit('update:filter', key)
}

const { tasks } = useTodos()

const tabs = computed(() => {
  const now = Date.now()
  return [
    { key: 'all', title: 'Все', count: tasks.value.length },
    { key: 'active', title: 'Активные', count: tasks.value.filter(t => !t.completed).length },
    { key: 'done', title: 'Выполненные', count: tasks.value.filter(t => t.completed).length },
    { key: 'favourite', title: 'Избранные', count: tasks.value.filter(t => t.favourite).length },
    { key: 'overdue', title: 'Просроченные', count: tasks.value.filter(t => t.deadline && new Date(t.deadline).getTime() < now && !t.completed).length },
  ]
})
</script>

<template>
  <div class="filters">
    <button
        v-for="f in tabs"
        :key="f.key"
        :class="['tab', { active: activeTab === f.key }]"
        @click="setActiveTab(f.key)"
    >
      {{ f.title }} <span class="count">({{ f.count }})</span>
    </button>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.tab {
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s ease;
  font-family: 'Guidy', sans-serif;
  font-weight: 500;
}
.tab:hover {
  background: rgba(255, 255, 255, 0.15);
}
.tab.active {
  background: linear-gradient(90deg, #087557, #3c8c6a);
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.2);
}
.count {
  opacity: 0.8;
  margin-left: 6px;
  font-weight: 400;
  font-family: 'Guidy', sans-serif;
}

@media (max-width: 480px) {
  .tab {
    padding: 5px 8px;
    font-size: 0.8rem;
  }
}
</style>
