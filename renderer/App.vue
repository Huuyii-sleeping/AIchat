<template>
  <n-config-provider class="h-full w-screen flex text-tx-primary">
    <aside class="sidebar h-full flex shrink-0 flex-col w-[200px]">
      Aside
    </aside>
    <div class="flex-auto">
      <TitleBar> <DragRegion class="w-full"> xq </DragRegion></TitleBar>
      Main
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import TitleBar from "./components/TitleBar.vue";
import DragRegion from "./components/DragRegion.vue";

</script>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
