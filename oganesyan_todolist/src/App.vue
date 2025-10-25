<script setup>
import { ref, computed } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import FiltersBar from './components/FiltersBar.vue'
import AddTask from './components/AddTask.vue'
import TodoItem from './components/TodoItem.vue'
import ChartsPanel from './components/ChartsPanel.vue'
import { useTodos } from './composables/useTodos.js'

const { tasks, addTodo, removeTodo, toggleCompleteTodo, toggleFavouriteTodo, editTodo } = useTodos()
const filter = ref('all')
const showStats = ref(false)

// Добавляем флаг isToday к каждой задаче
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
</script>

<template>
  <div class="container">
    <HeaderBar />
    <FiltersBar v-model:filter="filter" />
    <button @click="toggleStats" class="toggle-stats-btn">
      {{ showStats ? 'Скрыть статистику' : 'Посмотреть статистику' }}
    </button>
    <div v-if="showStats" class="stats-container">
      <ChartsPanel />
    </div>
    <div class="drag-drop-section">
      <div
          class="drag-drop-container"
          @drop="(e) => onDrop(e, 'today')"
          @dragover="onDragOver"
      >
        <h3>Задания на сегодня</h3>
        <div v-if="todayTasks.length === 0" class="drag-drop-area">
          Перетащите сюда задачи на сегодня
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
    </div>
    <AddTask @add="addTask" />
    <div
        class="main-tasks-container"
        @drop="(e) => onDrop(e, 'main')"
        @dragover="onDragOver"
    >
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
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  background: linear-gradient(180deg, #0a221c, #132a21);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-stats-btn {
  padding: 10px 15px;
  background: linear-gradient(90deg, #09bea9, #6bffd3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.toggle-stats-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.stats-container {
  width: 100%;
  margin-bottom: 16px;
}

.drag-drop-section {
  margin-bottom: 16px;
}

.drag-drop-container {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  min-height: 100px;
}

.drag-drop-container h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text);
}

.drag-drop-area {
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
</style>