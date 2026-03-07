<script setup lang="ts">
import Layout from "./components/Layout.vue";
import Header from "./components/Header.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import { ref } from "vue";
const openIncidentsSignal = ref(0);

function handleOpenIncidents() {
  openIncidentsSignal.value++;
}
</script>
<template>
  <Layout>
    <Header @open-incidents="handleOpenIncidents" />
    <DashboardPage :open-incidents-signal="openIncidentsSignal" />
  </Layout>
</template>
