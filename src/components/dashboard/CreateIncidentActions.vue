<script setup lang="ts">
const props = defineProps<{
  errorMessage: string;
  buttonLabel: string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
}>();
</script>

<template>
  <div class="actions">
    <button class="app-button" @click="emit('submit')">
      {{ props.buttonLabel }}
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

.error-text {
  color: #b91c1c;
  font-size: 14px;
  margin: 0;
}
</style>
