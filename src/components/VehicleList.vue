<script setup lang="ts">
import type { Vehicle } from "../types/gps";
import VehicleCard from "./VehicleCard.vue";
const props = defineProps<{
  vehicles: Vehicle[];
}>();
const emit = defineEmits<{
  (e: "select", vehicle: Vehicle): void;
}>();
function handleSelect(vehicle: Vehicle) {
  emit("select", vehicle);
}
</script>
<template>
  <ul class="list">
    <VehicleCard
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      :vehicle="vehicle"
      @select="handleSelect"
    />
  </ul>
</template>
<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
