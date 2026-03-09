<script setup lang="ts">
const props = defineProps<{
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: "create-incident"): void;
}>();
</script>

<template>
  <div class="actions">
    <button class="primary-button" @click="emit('create-incident')">
      Create incident
    </button>

    <p v-if="props.errorMessage" class="error-text">
      {{ props.errorMessage }}
    </p>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actions button {
  background-color: rgb(19, 76, 174);
  color: white;
  border: 0px;
  box-shadow: var(--shadow);
}

.actions button:hover {
  cursor: pointer;
}

.error-text {
  color: #b91c1c;
  font-size: 14px;
  margin: 0;
}
</style>
