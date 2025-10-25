<script setup>
import { computed } from "vue"
import { useTodos } from "../composables/useTodos.js"
const { tasks } = useTodos()

const totalCount = computed(() => tasks.value.length)
const doneCount = computed(() => tasks.value.filter(t => t.completed).length)
</script>

<template>
  <header class="header-bar">
    <div class="title-block">
      <div class="icon">📋</div>
      <div class="titles">
        <h1>Мои задачи</h1>
        <div class="stats">
          <span class="stat done">Выполнено: {{ doneCount }}</span>
          <span class="stat total">Все: {{ totalCount }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, #bbe0cf, #49f1c4);
  border-radius: 12px;
  margin-bottom: 16px;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 32px;
}

.titles {
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 0;
  font-size: 1.3rem;
}

.stats {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.stat {
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.stat.done { background: #079d7c }
.stat.total { background: #6b5cff }
</style>
