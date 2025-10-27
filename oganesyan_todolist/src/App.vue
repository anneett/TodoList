<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import FiltersBar from './components/FiltersBar.vue'
import AddTask from './components/AddTask.vue'
import TodoItem from './components/TodoItem.vue'
import ChartsPanel from './components/ChartsPanel.vue'
import { useTodos } from './composables/useTodos.js'

const { tasks, addTodo, removeTodo, toggleCompleteTodo, toggleFavouriteTodo, editTodo } = useTodos()
const filter = ref('all')
const showStats = ref(false)
const isFloatingDropZoneVisible = ref(false)

tasks.value.forEach(task => {
  task.isToday = false
})

const addTask = (payload) => {
  const newTask = { ...payload, isToday: false }
  addTodo(newTask)
}

const removeTask = (id) => {
  removeTodo(id)
}

const toggleComplete = (id) => toggleCompleteTodo(id)
const toggleFavorite = (id) => toggleFavouriteTodo(id)
const editTask = (payload) => editTodo(payload)

const updateTodayTasks = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  tasks.value.forEach(task => {
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline)
      deadlineDate.setHours(0, 0, 0, 0)
      if (deadlineDate.getTime() === now.getTime() && !task.isToday) {
        task.isToday = true
      }
    }
  })
}

const clearTodayTasks = () => {
  tasks.value.forEach(task => {
    if (task.isToday) {
      task.isToday = false
    }
  })
}

const filteredTasks = computed(() => {
  const now = Date.now()
  if (filter.value === 'all') return tasks.value.filter(t => !t.isToday)
  if (filter.value === 'active') return tasks.value.filter(t => !t.completed && !t.isToday)
  if (filter.value === 'done') return tasks.value.filter(t => t.completed && !t.isToday)
  if (filter.value === 'favourite') return tasks.value.filter(t => t.favourite && !t.isToday)
  if (filter.value === 'overdue') return tasks.value.filter(t => t.deadline && new Date(t.deadline).getTime() < now && !t.completed && !t.isToday)
  return tasks.value.filter(t => !t.isToday)
})

const todayTasks = computed(() => {
  return tasks.value.filter(task => task.isToday)
})

const toggleStats = () => {
  showStats.value = !showStats.value
}

function onDrop(event, targetList) {
  event.preventDefault()
  const taskId = event.dataTransfer.getData('taskId')
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  if (targetList === 'today') {
    task.isToday = true
  } else {
    task.isToday = false
  }
}

function onDragOver(event) {
  event.preventDefault()
}

function checkScroll() {
  const scrollPosition = window.scrollY
  isFloatingDropZoneVisible.value = scrollPosition > 100
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  setTimeout(checkScroll, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <div class="container">
    <HeaderBar />
    <FiltersBar v-model:filter="filter" />

    <div class="button-container">
      <button @click="toggleStats" class="stats-btn">
        {{ showStats ? 'Скрыть статистику' : 'Посмотреть статистику' }}
      </button>

      <div class="action-buttons">
        <button @click="updateTodayTasks" class="update-btn">
          Обновить
        </button>
        <button @click="clearTodayTasks" class="clear-btn">
          Очистить
        </button>
      </div>
    </div>

    <div v-if="showStats" class="stats-container">
      <ChartsPanel />
    </div>

    <div class="today-tasks-section">
      <h3>Задания на сегодня</h3>
      <div v-if="todayTasks.length === 0" class="empty-today">
        Нет задач на сегодня
      </div>
      <div v-else class="today-tasks-list">
        <TodoItem
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
            @toggle-complete="toggleComplete"
            @remove="removeTask"
            @toggle-favorite="toggleFavorite"
            @edit="editTask"
        />
      </div>
    </div>

    <AddTask @add="addTask" />

    <div class="main-tasks-container">
      <h3>Основные задачи</h3>
      <div v-if="filteredTasks.length === 0" class="empty">Нет задач</div>
      <div v-else class="tasks-list">
        <TodoItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @toggle-complete="toggleComplete"
            @remove="removeTask"
            @toggle-favorite="toggleFavorite"
            @edit="editTask"
        />
      </div>
    </div>

    <div
        class="floating-drop-zone"
        :class="{ 'visible': isFloatingDropZoneVisible }"
        @drop="(e) => onDrop(e, 'today')"
        @dragover="onDragOver"
    >
      <div class="drop-zone-content">
        <span>Перетащите сюда задачи на сегодня</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --main-font: 'Guidy', sans-serif;
}

.container {
  width: 100%;
  background: linear-gradient(180deg, #0a221c, #132a21);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  font-family: var(--main-font);
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}

.stats-btn {
  padding: 10px 16px;
  background: linear-gradient(90deg, #087557, #3c8c6a);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.stats-btn, .update-btn, .clear-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 40px;
  font-family: var(--main-font);
  font-weight: 500;
}

.update-btn {
  background: linear-gradient(90deg, #15546b, #3c8aa4);
}

.clear-btn {
  background: linear-gradient(90deg, #ff4141, #ff5757);
}

.stats-btn:hover, .update-btn:hover, .clear-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.stats-container {
  width: 100%;
  margin-bottom: 16px;
}

.today-tasks-section {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 16px;
}

.today-tasks-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text);
}

.empty-today {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 10px;
}

.today-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.main-tasks-container {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
}

.main-tasks-container h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 10px;
}

.floating-drop-zone {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 960px;
  background: rgba(16, 34, 28, 0.95);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  z-index: 100;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.floating-drop-zone.visible {
  opacity: 1;
}

.drop-zone-content {
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Guidy', sans-serif;
  font-weight: 500;
}

h3 {
  font-family: var(--main-font);
  font-weight: 500;
}
</style>
