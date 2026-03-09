<script setup lang="ts">
const props = defineProps<{
  dispatchLat: number | null;
  dispatchLng: number | null;
  isLoadingRoadLocation: boolean;
  roadLocationError: string;
  manualRoad: string;
  manualKm: string;
  manualDirection: string;
  roadResolveError: string;
  isResolvingRoadLocation: boolean;
}>();

const emit = defineEmits<{
  (e: "update:manualRoad", value: string): void;
  (e: "update:manualKm", value: string): void;
  (e: "update:manualDirection", value: string): void;
  (e: "apply-road-location"): void;
}>();
</script>

<template>
  <div class="incidentPanel">
    <div class="panel-header">
      <div>
        <h3>Incident road reference</h3>
        <p>Detected road / highway info for the selected incident point.</p>
      </div>
    </div>

    <p
      v-if="props.dispatchLat === null || props.dispatchLng === null"
      class="empty-state"
    >
      No incident selected
    </p>

    <p v-else-if="props.isLoadingRoadLocation">Detecting road location...</p>
    <p v-else-if="props.roadLocationError" class="error-text">
      {{ props.roadLocationError }}
    </p>

    <div class="road-meta-row">
      <span class="road-meta-label">Road</span>
      <input
        :value="props.manualRoad"
        class="road-input"
        placeholder="D1"
        @input="
          emit('update:manualRoad', ($event.target as HTMLInputElement).value)
        "
      />
    </div>

    <div class="road-meta-row">
      <span class="road-meta-label">KM</span>
      <input
        :value="props.manualKm"
        class="road-input"
        placeholder="50.0"
        @input="
          emit('update:manualKm', ($event.target as HTMLInputElement).value)
        "
      />
    </div>

    <div class="road-meta-row">
      <span class="road-meta-label">Direction</span>
      <input
        :value="props.manualDirection"
        class="road-input"
        placeholder="eg. Praha..."
        @input="
          emit(
            'update:manualDirection',
            ($event.target as HTMLInputElement).value,
          )
        "
      />
    </div>

    <div class="road-actions">
      <button class="primary-button" @click="emit('apply-road-location')">
        {{
          props.isResolvingRoadLocation
            ? "Locating..."
            : "Set incident from road"
        }}
      </button>
    </div>

    <p v-if="props.roadResolveError" class="error-text">
      {{ props.roadResolveError }}
    </p>
  </div>
</template>

<style scoped>
.incidentPanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.error-text {
  color: #b91c1c;
  font-size: 14px;
  margin: 0;
}

.road-meta-row {
  display: grid;
  grid-template-columns: 84px 1fr;
  align-items: center;
  gap: 12px;
}

.road-meta-label {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}

.road-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}

.road-actions {
  display: flex;
}

.primary-button {
  border: none;
  border-radius: 12px;
  padding: 11px 14px;
  background: #111827;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
</style>
