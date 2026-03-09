<script setup lang="ts">
import { formatEta } from "../../utils/eta";
import type { VehicleWithDistance } from "../../types/gps";

const props = defineProps<{
  vehicles: VehicleWithDistance[];
  selectedVehicleId: string | number | null;
}>();

const emit = defineEmits<{
  (e: "select-vehicle", vehicle: VehicleWithDistance): void;
}>();

function isSelected(vehicleId: string | number) {
  return String(props.selectedVehicleId) === String(vehicleId);
}
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h3>Nearest Vehicles</h3>
        <p>Best candidates ranked by distance and ETA.</p>
      </div>
    </div>

    <p v-if="props.vehicles.length === 0" class="empty-state">
      No matching vehicles found
    </p>

    <ul v-else class="nearest-list">
      <li
        v-for="vehicle in props.vehicles.slice(0, 10)"
        :key="vehicle.id"
        :class="[
          'nearest-item',
          { 'nearest-item--selected': isSelected(vehicle.id) },
        ]"
        @click="emit('select-vehicle', vehicle)"
      >
        <div class="nearest-main">
          <strong>{{ vehicle.name }}</strong>
          <span class="badge">{{ vehicle.branchName || "No branch" }}</span>
        </div>

        <div class="nearest-meta">
          <span>{{ vehicle.distanceKm.toFixed(2) }} km</span>
          <span>ETA: {{ formatEta(vehicle.etaMinutes) }}</span>
          <span>{{ vehicle.speed }} km/h</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
}

.panel-header h3 {
  margin: 0;
}

.panel-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.empty-state {
  color: #64748b;
  font-size: 14px;
}

.nearest-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nearest-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
  background: #fff;
}

.nearest-item:hover {
  transform: translateY(-1px);
  border-color: #cbd5e1;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.nearest-item--selected {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
}

.nearest-main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.nearest-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #475569;
  font-size: 14px;
}

.badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  background: #f1f5f9;
  color: #334155;
}
</style>
