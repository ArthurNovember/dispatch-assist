<template>
  <div class="headerDiv">
    <header class="header">
      <div>
        <p class="eyebrow">Fleet Operations Dashboard</p>
        <h1>Dispatch Assist</h1>
        <p class="subtitle">Vehicle Assignment Tool</p>
      </div>
    </header>
    <button class="menu-button" @click="emit('open-incidents')">☰</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "open-incidents"): void;
}>();
</script>

<style scoped>
.header {
  padding-left: 24px;
  padding-bottom: 24px;
  padding-top: 24px;
  border-bottom-left-radius: 20px;
  border-top-left-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 100%;
  height: 100%;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #93c5fd;
}

h1 {
  margin: 0;
  font-size: 36px;
  line-height: 1.1;
}

.subtitle {
  margin: 8px 0 0;
  color: #cbd5e1;
}
.menu-button {
  border-bottom-left-radius: 0px;
  border-top-left-radius: 0px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 50px;
}

.headerDiv {
  display: flex;
  margin-bottom: 24px;
}
</style>
