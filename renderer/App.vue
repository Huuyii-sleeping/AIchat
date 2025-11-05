<template>
  <n-config-provider class="h-full w-screen flex text-tx-primary">
    <aside
      class="sidebar h-full flex shrink-0 flex-col"
      :style="{ width: sidebarSizeWidth + 'px' }"
    >
      <div class="flex-auto flex">
        <nav-bar></nav-bar>
        <div class="flex-auto">conversation-list</div>
      </div>
    </aside>
    <resize-divider
      direction="vertical"
      v-model:size="sidebarSizeWidth"
      :max-size="800"
      :min-size="320"
    ></resize-divider>
    <div class="flex-auto">
      <title-bar> <drag-region class="w-full"> xq </drag-region></title-bar>
      Main
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import TitleBar from "./components/TitleBar.vue";
import DragRegion from "./components/DragRegion.vue";
import NavBar from "./components/NavBar.vue";
import ResizeDivider from "./components/ResizeDivider.vue";

const sidebarSizeWidth = ref(320);
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
