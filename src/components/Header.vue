<template>
  <header class="header">
    <div>
      <p class="eyebrow">Fleet Operations Dashboard</p>
      <h1>Dispatch Assist</h1>
      <p class="subtitle">Vehicle Assignment Tool</p>
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.header {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
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
</style>
