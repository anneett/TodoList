<script setup>
import TodoItem from './TodoItem.vue'
defineProps({ tasks: { type: Array, default: () => [] } })
const emit = defineEmits(['toggle-complete','remove','toggle-favorite','edit'])
</script>

<template>
  <div>
    <div v-if="tasks.length === 0" class="empty">Нет задач</div>
    <div class="list">
      <TodoItem
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @toggle-complete="$emit('toggle-complete', $event)"
          @remove="$emit('remove', $event)"
          @toggle-favorite="$emit('toggle-favorite', $event)"
          @edit="$emit('edit', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.list{display:flex;flex-direction:column;gap:14px}
.empty{padding:20px;border-radius:10px;background:rgba(255,255,255,0.03);text-align:center}
</style>
