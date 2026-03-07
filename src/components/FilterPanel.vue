<script setup lang="ts">
const props = defineProps<{
  radiusKm: number;
  selectedBranch: string;
  onlineOnly: boolean;
  availableBranches: string[];
}>();
const emit = defineEmits<{
  (e: "update:radiusKm", value: number): void;
  (e: "update:selectedBranch", value: string): void;
  (e: "update:onlineOnly", value: boolean): void;
}>();
function onRadiusChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:radiusKm", Number(target.value));
}
function onBranchChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:selectedBranch", target.value);
}
function onOnlineOnlyChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:onlineOnly", target.checked);
}
</script>
<template>
  <div class="filter-panel">
    <h3>Filters</h3>
    <div class="field">
      <label for="radius">Radius</label>
      <select id="radius" :value="radiusKm" @change="onRadiusChange">
        <option :value="5">5 km</option>
        <option :value="10">10 km</option>
        <option :value="20">20 km</option>
        <option :value="50">50 km</option>
        <option :value="99999">All</option>
      </select>
    </div>
    <div class="field">
      <label for="branch">Branch</label>
      <select id="branch" :value="selectedBranch" @change="onBranchChange">
        <option value="">All branches</option>
        <option
          v-for="branch in availableBranches"
          :key="branch"
          :value="branch"
        >
          {{ branch }}
        </option>
      </select>
    </div>
    <div class="field checkbox-field">
      <label>
        <input
          type="checkbox"
          :checked="onlineOnly"
          @change="onOnlineOnlyChange"
        />
        Online only
      </label>
    </div>
  </div>
</template>
<style scoped>
.filter-panel {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
}
.field {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.checkbox-field {
  display: block;
}
</style>
