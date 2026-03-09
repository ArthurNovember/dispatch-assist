<script setup lang="ts">
const props = defineProps<{
  clientName: string;
  clientPhone: string;
  clientLicensePlate: string;
  vehicleIssue: string;
  operatorNote: string;
}>();

const emit = defineEmits<{
  (e: "update:clientName", value: string): void;
  (e: "update:clientPhone", value: string): void;
  (e: "update:clientLicensePlate", value: string): void;
  (e: "update:vehicleIssue", value: string): void;
  (e: "update:operatorNote", value: string): void;
}>();
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h3>Client info</h3>
      </div>
    </div>

    <div class="incident-form">
      <input
        :value="props.clientName"
        class="road-input"
        placeholder="Client name"
        @input="
          emit('update:clientName', ($event.target as HTMLInputElement).value)
        "
      />

      <input
        :value="props.clientPhone"
        class="road-input"
        placeholder="Client phone"
        @input="
          emit('update:clientPhone', ($event.target as HTMLInputElement).value)
        "
      />

      <input
        :value="props.clientLicensePlate"
        class="road-input"
        placeholder="Client license plate"
        @input="
          emit(
            'update:clientLicensePlate',
            ($event.target as HTMLInputElement).value,
          )
        "
      />

      <input
        :value="props.vehicleIssue"
        class="road-input"
        placeholder="Vehicle issue"
        @input="
          emit('update:vehicleIssue', ($event.target as HTMLInputElement).value)
        "
      />

      <textarea
        :value="props.operatorNote"
        class="road-textarea"
        placeholder="Operator note"
        rows="3"
        @input="
          emit(
            'update:operatorNote',
            ($event.target as HTMLTextAreaElement).value,
          )
        "
      ></textarea>
    </div>
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

.panel-header {
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0;
}

.incident-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.road-input,
.road-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}

.road-textarea {
  resize: vertical;
}
</style>
