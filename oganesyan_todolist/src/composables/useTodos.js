import { ref, watch } from 'vue'

const STORAGE_KEY = 'vue_todos_v1'

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const tasks = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

watch(tasks, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useTodos() {
    const addTodo = ({ title, description, deadline }) => {
        const newTask = {
            id: uid(),
            title: title || 'Без названия',
            description: description || '',
            createdAt: new Date().toISOString(),
            deadline: deadline || null,
            completed: false,
            favourite: false
        }
        tasks.value.unshift(newTask)
    }

    const removeTodo = (id) => {
        tasks.value = tasks.value.filter(t => t.id !== id)
    }

    const toggleCompleteTodo = (id) => {
        const t = tasks.value.find(x => x.id === id)
        if (t) t.completed = !t.completed
    }

    const toggleFavouriteTodo = (id) => {
        const t = tasks.value.find(x => x.id === id)
        if (t) t.favourite = !t.favourite
    }

    const editTodo = ({ id, title, description, deadline }) => {
        const t = tasks.value.find(x => x.id === id)
        if (t) {
            if (title !== undefined) t.title = title
            if (description !== undefined) t.description = description
            if (deadline !== undefined) t.deadline = deadline
        }
    }

    return { tasks, addTodo, removeTodo, toggleCompleteTodo, toggleFavouriteTodo, editTodo }
}
