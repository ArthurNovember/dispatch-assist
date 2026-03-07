<script setup lang="ts">
import type { VehicleTrip } from "../types/gps";
defineProps<{
  trips: VehicleTrip[];
  isLoading: boolean;
  errorMessage: string;
}>();
function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
</script>
<template>
  <div class="trips-table">
    <h3>Trips</h3>
    <p v-if="isLoading">Loading trips...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="trips.length === 0">No trips loaded</p>
    <table v-else>
      <thead>
        <tr>
          <th>Start</th>
          <th>Finish</th>
          <th>Duration</th>
          <th>Distance</th>
          <th>Avg speed</th>
          <th>Max speed</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trip, index) in trips" :key="index">
          <td>{{ formatDateTime(trip.startTime) }}</td>
          <td>{{ formatDateTime(trip.finishTime) }}</td>
          <td>{{ trip.tripLength }}</td>
          <td>{{ trip.totalDistance }} km</td>
          <td>{{ trip.averageSpeed }} km/h</td>
          <td>{{ trip.maxSpeed }} km/h</td>
          <td>{{ trip.purpose || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.trips-table {
  overflow-x: auto;
}

.trips-table h3 {
  margin-top: 0;
  margin-bottom: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  color: #475569;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 14px;
}

tr:hover td {
  background: #f8fbff;
}
</style>
