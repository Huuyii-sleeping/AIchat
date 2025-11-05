<template>
  <header class="title-bar flex items-start justify-between h-[30px]">
    <div class="title-bar-main flex-auto">
      <slot>{{ title ?? "" }}</slot>
    </div>
    <div class="title-bar-controls w-20 flex items-center justify-end text-tx-secondary">
      <button
        v-show="isMinimizable"
        class="title-bar-button cursor-pointer hover:bg-input"
        @click="minimizeWindow"
      >
        <iconify-icon
          icon="codicon:chrome-minimize"
          :width="btnSize"
          :height="btnSize"
        ></iconify-icon>
      </button>
      <button
        v-show="isMaximizable"
        class="title-bar-button cursor-pointer hover:bg-input"
        @click="maximizeWindow"
      >
        <iconify-icon
          icon="codicon:chrome-maximize"
          :width="btnSize"
          :height="btnSize"
          v-show="!isMaximized"
        ></iconify-icon>
        <iconify-icon
          icon="codicon:chrome-restore"
          :width="btnSize"
          :height="btnSize"
          v-show="isMaximized"
        ></iconify-icon>
      </button>
      <button
        v-show="isClosable"
        class="title-bar-button cursor-pointer hover:bg-red-300 close-button"
        @click="handleClose"
      >
        <iconify-icon
          icon="codicon:chrome-close"
          :width="btnSize"
          :height="btnSize"
        ></iconify-icon>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from "@iconify/vue";
import { useWinManager } from "@renderer/hooks/useWindowManager";

interface TitleBarProps {
  title?: string;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  isClosable?: boolean;
}
defineOptions({ name: "TitleBar" });
withDefaults(defineProps<TitleBarProps>(), {
  isMaximizable: true,
  isMinimizable: true,
  isClosable: true,
});
const btnSize = 20;
const emit = defineEmits(["close"]);
const { isMaximized, closeWindow, minimizeWindow, maximizeWindow } =
  useWinManager();
function handleClose() {
  emit("close");
  closeWindow();
}
</script>

<style scoped>
.title-bar-button {
  padding: 2px;
  border-radius: 50%;
  margin: 1rem;
}
</style>
