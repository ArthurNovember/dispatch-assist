<script setup lang="ts">
import { ref } from "vue";
import { searchAddress } from "../services/geocoding";
import type { GeocodingResult } from "../types/gps";
const emit = defineEmits<{
  (
    e: "select-address",
    value: { lat: number; lng: number; label: string },
  ): void;
}>();

const query = ref("");
const results = ref<GeocodingResult[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
async function onSearch() {
  if (!query.value.trim()) return;
  isLoading.value = true;
  errorMessage.value = "";
  try {
    results.value = await searchAddress(query.value);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to search address";
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}
function selectResult(result: GeocodingResult) {
  emit("select-address", result);
  results.value = [];
  query.value = result.label;
}
</script>
<template>
  <div class="address-search">
    <h3>Find incident by address</h3>
    <div class="search-row">
      <input
        v-model="query"
        type="text"
        placeholder="Enter address"
        @keyup.enter="onSearch"
      />

      <button @click="onSearch">Search</button>
    </div>
    <p v-if="isLoading">Searching address...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <ul v-else-if="results.length > 0" class="results">
      <li
        v-for="result in results"
        :key="result.label"
        @click="selectResult(result)"
        class="result-item"
      >
        {{ result.label }}
      </li>
    </ul>
  </div>
</template>
<style scoped>
.address-search {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 12px;
  height: 100%;
}
.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
input {
  flex: 1;
  padding: 8px;
}
.results {
  list-style: none;
  padding: 0;
  margin: 0;
}
.result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.result-item:hover {
  background: #f7f7f7;
}
</style>
