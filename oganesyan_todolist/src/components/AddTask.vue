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
</script>

<template>
  <div class="add-task">
    <div class="input-row">
      <input v-model="title" placeholder="Добавить новое дело" @keyup.enter="onAdd" />
      <input v-model="description" placeholder="Описание" />
      <input v-model="deadline" type="datetime-local" class="deadline" />
      <button @click="onAdd" class="btn">Добавить</button>
    </div>
    <div v-if="showWarning" class="warning">
      Пожалуйста, заполните название и укажите дедлайн.
    </div>
  </div>
</template>

<style scoped>
.add-task {
  margin-bottom: 16px;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

input[type="text"], input[type="datetime-local"] {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-weight: 500;
  transition: all 0.2s ease;
}

input[type="text"]::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input[type="text"]:focus, input[type="datetime-local"]:focus {
  outline: none;
  border-color: #7c5cff;
  background: rgba(124, 92, 255, 0.1);
}

.btn {
  background: linear-gradient(90deg, #09bea9, #6bffd3);
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.warning {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
}
</style>
