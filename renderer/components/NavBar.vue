<template>
  <drag-region>
    <nav
      class="h-[calc(100%-1.4em)] flex flex-col px-4 py-2 mt-[.7rem] mb-[.7rem] border-r border-r-input text-tx-secondary"
    >
      <ul class="flex-auto">
        <li
          class="sidebar-item no-drag cursor-pointer hover:text-primary-hover text-tx-primary"
        >
          <native-tooltip :content="t('main.sidebar.conversations')">
            <iconify-icon icon="lets-icons:comment" width="24" height="24" />
          </native-tooltip>
        </li>
      </ul>
      <ul>
        <li
          class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle mb-5"
        >
          <theme-switcher />
        </li>
        <li
          class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle"
          @click="openSettingWindow"
        >
          <native-tooltip :content="t('main.sidebar.settings')">
            <iconify-icon icon="uil:setting" width="24" height="24" />
          </native-tooltip>
        </li>
      </ul>
    </nav>
  </drag-region>
</template>

<script setup lang="ts">
import DragRegion from "./DragRegion.vue";
import { Icon as IconifyIcon } from "@iconify/vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import NativeTooltip from "./NativeTooltip.vue";
defineOptions({ name: "NavBar" });
const { t } = useI18n();
const openSettingWindow = () => {};
</script>

<style scoped></style>
