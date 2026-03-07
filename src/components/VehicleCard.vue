<script setup lang="ts">
import type { Vehicle } from "../types/gps";
const props = defineProps<{
  vehicle: Vehicle;
}>();
const emit = defineEmits<{
  (e: "select", vehicle: Vehicle): void;
}>();
function onClick() {
  emit("select", props.vehicle);
}
</script>
<template>
  <li class="card" @click="onClick">
    <strong>{{ vehicle.name }}</strong>
    <div class="meta">
      <span>SPZ: {{ vehicle.spz || "—" }}</span>
      <span>Speed: {{ vehicle.speed }} km/h</span>
    </div>
    <div class="meta">
      <span>Lat: {{ vehicle.lat }}</span>
      <span>Lng: {{ vehicle.lng }}</span>
    </div>
  </li>
</template>
<style scoped>
.card {
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
}
.meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 6px;
}
</style>
