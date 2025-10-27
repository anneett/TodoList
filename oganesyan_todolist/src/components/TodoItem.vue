<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['toggle-complete', 'remove', 'toggle-favorite', 'edit'])

const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editDeadline = ref('')
const showWarning = ref(false)

const isOverdue = computed(() => {
  if (!props.task.deadline) return false
  return new Date(props.task.deadline).getTime() < Date.now() && !props.task.completed
})

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function startEdit() {
  editing.value = true
  editTitle.value = props.task.title
  editDescription.value = props.task.description || ''
  editDeadline.value = props.task.deadline ? new Date(props.task.deadline).toISOString().slice(0, 16) : ''
}

function cancelEdit() {
  editing.value = false
  showWarning.value = false
}

function saveEdit() {
  if (!editTitle.value.trim() || !editDeadline.value) {
    showWarning.value = true
    return
  }
  emit('edit', {
    id: props.task.id,
    title: editTitle.value.trim(),
    description: editDescription.value.trim(),
    deadline: editDeadline.value ? new Date(editDeadline.value).toISOString() : null
  })
  editing.value = false
  showWarning.value = false
}

function onDragStart(event) {
  event.dataTransfer.setData('taskId', props.task.id)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div
      :class="['todo-card', { done: task.completed, overdue: isOverdue }]"
      draggable="true"
      @dragstart="onDragStart"
  >
    <div class="left">
      <button class="check" @click="$emit('toggle-complete', task.id)">
        <span v-if="task.completed">✔️</span>
      </button>
    </div>
    <div class="center">
      <div class="title-row">
        <h3 class="title">{{ task.title }}</h3>
        <div class="actions">
          <button class="icon" @click="$emit('toggle-favorite', task.id)">{{ task.favourite ? '⭐' : '☆' }}</button>
          <button class="icon" @click="startEdit">✏️</button>
          <button class="icon delete" @click="$emit('remove', task.id)">🗑️</button>
        </div>
      </div>
      <div class="desc" v-if="task.description">{{ task.description }}</div>
      <div class="meta">
        <div class="meta-item">Создано: {{ fmt(task.createdAt) }}</div>
        <div v-if="task.deadline" class="meta-item">Дедлайн: {{ fmt(task.deadline) }}</div>
        <div v-if="isOverdue && !task.completed" class="badge overdue">Просрочено</div>
      </div>
    </div>
  </div>
  <div v-if="editing" class="edit-panel">
    <input v-model="editTitle" placeholder="Название" />
    <input v-model="editDescription" placeholder="Описание" />
    <input v-model="editDeadline" type="datetime-local" />
    <div v-if="showWarning" class="warning">
      Пожалуйста, заполните название и укажите дедлайн.
    </div>
    <div class="edit-controls">
      <button @click="saveEdit">Сохранить</button>
      <button @click="cancelEdit">Отмена</button>
    </div>
  </div>
</template>

<style scoped>
.todo-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: linear-gradient(180deg, #3dab88, #0b6c55);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  color: white;
  cursor: grab;
  font-family: 'Guidy', sans-serif;
}

.todo-card:active {
  cursor: grabbing;
}

.todo-card.done {
  opacity: 0.6;
  text-decoration: line-through;
}

.left .check {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: transparent;
}

.left .check:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.todo-card.done .left .check {
  background: rgba(130, 229, 194, 0.62);
  border-color: rgba(189, 220, 202, 0.84);
}

.center {
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
  font-family: 'Guidy', sans-serif;
}

.actions {
  display: flex;
  gap: 1px;
}

.icon {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.delete {
  opacity: 0.9;
}

.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.meta-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: 'Guidy', sans-serif;
}

.badge.overdue {
  background: #184b31;
  padding: 6px 10px;
  border-radius: 8px;
  color: white;
  font-weight: 400;
  font-family: 'Guidy', sans-serif;
}

.edit-panel {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.edit-panel input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  font-family: 'Guidy', sans-serif;
}

.edit-controls {
  display: flex;
  gap: 8px;
}

.edit-controls button {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  font-family: 'Guidy', sans-serif;
}

.warning {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
}

.check {
  font-size: 16px;
}

@media (max-width: 768px) {
  .todo-card {
    flex-direction: column;
    padding: 10px;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .meta-item {
    font-size: 0.8rem;
  }
}
</style>
