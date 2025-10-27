<script setup>
import { ref } from 'vue'

const title = ref('')
const description = ref('')
const deadline = ref('')
const showWarning = ref(false)
const emit = defineEmits(['add'])

const onAdd = () => {
  if (!title.value.trim() || !deadline.value) {
    showWarning.value = true
    return
  }

  const payload = {
    title: title.value.trim(),
    description: description.value.trim(),
    deadline: deadline.value ? new Date(deadline.value).toISOString() : null
  }

  emit('add', payload)
  title.value = ''
  description.value = ''
  deadline.value = ''
  showWarning.value = false
}

// Ограничиваем ввод года 4 цифрами
const limitYearInput = (event) => {
  const value = event.target.value
  if (value.length > 4 && event.inputType === 'insertText') {
    event.target.value = value.slice(0, 4)
  }
}
</script>

<template>
  <div class="add-task">
    <div class="form-container">
      <div class="form-row">
        <input
            v-model="title"
            placeholder="Название задачи"
            @keyup.enter="onAdd"
            class="task-input"
        />
      </div>
      <div class="form-row">
        <textarea
            v-model="description"
            placeholder="Описание задачи"
            class="task-input description-input"
            rows="2"
        ></textarea>
      </div>
      <div class="form-row deadline-row">
        <input
            v-model="deadline"
            type="datetime-local"
            class="task-input deadline-input"
            @input="limitYearInput"
        />
        <button @click="onAdd" class="add-btn">Добавить</button>
      </div>
    </div>
    <div v-if="showWarning" class="warning-container">
      <div class="warning-icon">⚠️</div>
      <div class="warning-message">
        Пожалуйста, заполните название задачи и укажите дедлайн
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-task {
  margin-bottom: 16px;
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: 'Guidy', sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
}

.task-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.task-input:focus {
  outline: none;
  border-color: #7c5cff;
  background: rgba(124, 92, 255, 0.1);
}

.description-input {
  resize: vertical;
  min-height: 60px;
  padding: 12px 16px;
  line-height: 1.5;
}

.deadline-row {
  display: flex;
  gap: 8px;
}

.deadline-input {
  flex: 1;
  min-width: 200px;
}

.add-btn {
  background: linear-gradient(90deg, #087557, #3c8c6a);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-family: 'Guidy', sans-serif;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.warning-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 69, 58, 0.15);
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: 12px;
  margin-top: 12px;
  animation: fadeIn 0.3s ease;
}

.warning-icon {
  color: #3d1414;
  font-size: 1.2rem;
}

.warning-message {
  color: #ff6b6b;
  font-family: 'Guidy', sans-serif;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .deadline-row {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
    margin-top: 8px;
  }

  .task-input, .description-input, .deadline-input {
    width: 100%;
  }
}
</style>
