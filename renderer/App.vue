<template>
  <n-config-provider class="h-full w-screen flex text-tx-primary">
    <aside
      class="sidebar h-full flex shrink-0 flex-col"
      :style="{ width: sidebarSizeWidth + 'px' }"
    >
      <div class="flex-auto flex">
        <nav-bar />
        <conversation-list class="flex-auto" :width="sidebarSizeWidth" />
      </div>
    </aside>
    <resize-divider
      direction="vertical"
      v-model:size="sidebarSizeWidth"
      :max-size="800"
      :min-size="320"
    />
    <div class="flex-auto">
      <router-view />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import { initProviders } from "./dataBase";
import NavBar from "./components/NavBar.vue";
import ResizeDivider from "./components/ResizeDivider.vue";
import ConversationList from "./components/ConversationList/index.vue";
import { useProviderStore } from "./stores/providers";
import { useConversationStore } from "./stores/conversations";
const sidebarSizeWidth = ref(320);
const { initialize: initializeProviderStore } = useProviderStore();
const { initialize: initializeConversationStore } = useConversationStore();
onMounted(async () => {
  await initProviders();
  await initializeProviderStore();
  await initializeConversationStore();
  console.info("App mounted");
});
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
  z-index: 100;
}
</style>
