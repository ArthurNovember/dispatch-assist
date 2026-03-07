<script setup lang="ts">
import type { Vehicle } from "../types/gps";
const props = defineProps<{
  vehicle: Vehicle | null;
}>();
const emit = defineEmits<{
  (e: "show-route"): void;
  (e: "show-trips"): void;
}>();
function formatLastSeen(timestamp: string | null): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
</script>
<template>
  <div class="vehicle-detail">
    <h3>Vehicle Detail</h3>
    <p v-if="!vehicle">No vehicle selected</p>
    <div v-else class="detail-grid">
      <div class="detail-row">
        <span class="label">Name</span>
        <span>{{ vehicle.name }}</span>
      </div>
      <div class="detail-row">
        <span class="label">SPZ</span>
        <span>{{ vehicle.spz || "—" }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Branch</span>
        <span>{{ vehicle.branchName || "—" }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Speed</span>
        <span>{{ vehicle.speed }} km/h</span>
      </div>
      <div class="detail-row">
        <span class="label">Latitude</span>
        <span>{{ vehicle.lat ?? "—" }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Longitude</span>
        <span>{{ vehicle.lng ?? "—" }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Last update</span>
        <span>{{ formatLastSeen(vehicle.lastPositionTimestamp) }}</span>
      </div>
      <div v-if="vehicle" class="actions">
        <div v-if="vehicle" class="actions">
          <button @click="emit('show-route')">Show last route</button>
          <button @click="emit('show-trips')">Show trips</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.vehicle-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vehicle-detail h3 {
  margin: 0;
  font-size: 18px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}

.label {
  font-weight: 600;
  color: #334155;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
