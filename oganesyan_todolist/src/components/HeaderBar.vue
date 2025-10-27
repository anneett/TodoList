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
  background: linear-gradient(180deg, #3c8c6a, #087557);
  border-radius: 12px;
  margin-bottom: 16px;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 40px;
}

.titles {
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
  font-family: 'Guidy', sans-serif;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 12px;
  margin-top: 7px;
}

.stat {
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  color: white;
  font-weight: 200;
  font-size: 1.1rem;
  font-family: 'Guidy', sans-serif;
  font-weight: 500;
}

.stat.done { background: #064b36
}
.stat.total { background: #064b36
}
</style>
