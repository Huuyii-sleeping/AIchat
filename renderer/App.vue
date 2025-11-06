<template>
  <n-config-provider class="h-full w-screen flex text-tx-primary">
    <aside
      class="sidebar h-full flex shrink-0 flex-col"
      :style="{ width: sidebarSizeWidth + 'px' }"
    >
      <div class="flex-auto flex">
        <nav-bar></nav-bar>
        <conversation-list class="flex-auto" :width="sidebarSizeWidth" />
      </div>
    </aside>
    <resize-divider
      direction="vertical"
      v-model:size="sidebarSizeWidth"
      :max-size="800"
      :min-size="320"
    ></resize-divider>
    <div class="flex-auto">
      <router-view></router-view>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import NavBar from "./components/NavBar.vue";
import ResizeDivider from "./components/ResizeDivider.vue";
import ConversationList from "./components/ConversationList/index.vue";

const sidebarSizeWidth = ref(320);
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
