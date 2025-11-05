<template>
  <native-tooltip :content="themeTooltip">
    <iconify-icon
      :icon="(themeIcon as string)"
      width="24"
      height="24"
      @click="toggleThemeMode"
    ></iconify-icon>
  </native-tooltip>
</template>

<script setup lang="ts">
import useThemeMode from "@renderer/hooks/useThemeMode";
import { Icon as IconifyIcon } from "@iconify/vue";
import NativeTooltip from "./NativeTooltip.vue";
defineOptions({ name: "ThemeSwitcher" });
const { themeIcon, themeTooltip, setThemeMode } = useThemeMode();
const isDarkMode = usePreferredDark();
function toggleThemeMode() {
  setThemeMode(isDarkMode.value ? "light" : "dark");
}
</script>

<style scoped lang="scss"></style>
