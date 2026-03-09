<script setup lang="ts">
import { computed } from "vue";
import type { DispatchIncident } from "../../types/incidents";

const props = defineProps<{
  isOpen: boolean;
  incidentSearch: string;
  incidents: DispatchIncident[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "new-incident"): void;
  (e: "open-incident", incidentId: string): void;
  (e: "update:incidentSearch", value: string): void;
}>();

const searchModel = computed({
  get: () => props.incidentSearch,
  set: (value: string) => emit("update:incidentSearch", value),
});
</script>

<template>
  <transition name="drawer-fade">
    <div v-if="isOpen" class="drawer-backdrop" @click="emit('close')">
      <aside class="incident-drawer" @click.stop>
        <div class="incident-drawer-header">
          <div>
            <h3>Incidents</h3>
            <p>Search and review all created incidents.</p>
          </div>

          <button class="drawer-close-button" @click="emit('close')">✕</button>
        </div>

        <button class="primary-button" @click="emit('new-incident')">
          New incident
        </button>

        <input
          v-model="searchModel"
          class="road-input"
          placeholder="Search by incident number"
        />

        <div v-if="incidents.length === 0" class="empty-state">
          No incidents created
        </div>

        <div v-else class="incident-list">
          <button
            v-for="incident in incidents"
            :key="incident.id"
            class="incident-card incident-card-button"
            type="button"
            @click="emit('open-incident', incident.id)"
          >
            <div class="incident-card-top">
              <strong>{{ incident.id }}</strong>
              <span class="incident-status">{{ incident.status }}</span>
            </div>

            <div class="incident-card-body">
              <p><strong>Client:</strong> {{ incident.clientName }}</p>
              <p>
                <strong>Location:</strong>
                {{
                  incident.km !== null
                    ? `${incident.road} km ${incident.km.toFixed(1)}`
                    : incident.location.addressLabel || incident.road
                }}
              </p>
              <p>
                <strong>Vehicle:</strong>
                {{
                  incident.assignedVehicle
                    ? `${incident.assignedVehicle.name} (${incident.assignedVehicle.spz || "—"})`
                    : "Unassigned"
                }}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </div>
  </transition>
</template>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-end;
  z-index: 40;
}

.incident-drawer {
  width: min(420px, 100%);
  height: 100%;
  background: #ffffff;
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 30px rgba(15, 23, 42, 0.16);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.incident-drawer-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.incident-drawer-header h3 {
  margin: 0;
}

.incident-drawer-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.drawer-close-button {
  border: 1px solid var(--border);
  background: #fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
}

.incident-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.incident-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: #fff;
  text-align: left;
}

.incident-card-button {
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.incident-card-button:hover {
  transform: translateY(-1px);
  border-color: #cbd5e1;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.incident-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.incident-status {
  font-size: 12px;
  color: #475569;
  text-transform: capitalize;
}

.incident-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.incident-card-body p {
  margin: 0;
  color: #334155;
  font-size: 14px;
}

.empty-state {
  color: #64748b;
  font-size: 14px;
}

.road-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}

.primary-button {
  border: none;
  border-radius: 12px;
  padding: 11px 14px;
  background: #111827;
  color: #fff;
  font: inherit;
  cursor: pointer;
  background-color: rgb(19, 76, 174);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.18s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>
