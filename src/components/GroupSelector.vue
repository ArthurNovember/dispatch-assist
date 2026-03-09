<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getGroups } from "../services/gpsdozor";
import type { Group } from "../types/gps";
const props = defineProps<{
  modelValue: string | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();
const groups = ref<Group[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
async function loadGroups() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    groups.value = await getGroups();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load groups";
  } finally {
    isLoading.value = false;
  }
}
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value || null);
}
onMounted(() => {
  loadGroups();
});
</script>
<template>
  <div class="group-selector">
    <p v-if="isLoading">Loading groups...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <select v-else :value="modelValue ?? ''" @change="handleChange">
      <option value="">Select group</option>
      <option v-for="group in groups" :key="group.code" :value="group.code">
        {{ group.name }}
      </option>
    </select>
  </div>
</template>
<style scoped>
.group-selector {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  height: 100%;
  border-radius: 16px;
}
</style>
