<template>
  <n-config-provider class="h-full w-screen flex">
    <aside class="h-screen flex shrink-0 flex-col bg-amber-600">Aside</aside>
    <div class="flex-auto">Main</div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
</script>

<style scoped></style>
