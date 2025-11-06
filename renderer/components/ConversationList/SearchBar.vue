<template>
  <div class="my-2" @contextmenu.stop @click.stop>
    <n-input-group>
      <n-input
        v-model:value="searchKey"
        size="small"
        :placeholder="t('main.conversation.searchPlaceholder')"
        clearable
      >
        <template #prefix>
          <iconify-icon icon="Serach"></iconify-icon>
        </template>
      </n-input>
      <n-input-group-label
        class="cursor-pointer flex justify-between items-center"
      >
        <n-icon>
          <iconify-icon icon="material-symbols:menu-rounded"></iconify-icon>
        </n-icon>
      </n-input-group-label>
    </n-input-group>
  </div>
</template>

<script setup lang="ts">
import { NInput, NInputGroup, NInputGroupLabel, NIcon } from "naive-ui";
import { Icon as IconifyIcon } from "@iconify/vue";
import { useFilter } from "./useFilter";
defineOptions({ name: "SearchBar" });
const { t } = useI18n();
const { searchKey } = useFilter();
</script>

<style scoped>
.n-input-wrapper,
.n-input__input {
  align-items: center;
}

.n-input-group-label,
.n-input__input {
  display: flex;
}

:deep(.n-input__input-el) {
  translate: 0 3px !important;
}
</style>
