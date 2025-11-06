<template>
  <n-select
    size="small"
    v-model:value="selectedProvider"
    :placeholder="t('main.conversation.selectModel')"
    :options="providerOptions"
  >
    <template #empty>
      <span class="text-tx-primary text-[0.7rem]"
        >{{ t("main.conversation.goSettings") }}
        <n-button
          class="go-settings-btn"
          size="tiny"
          @click="openSettingWindow"
          text
          >{{ t("main.conversation.settings") }}</n-button
        >{{ t("main.conversation.addModel") }}
      </span>
    </template>
  </n-select>
</template>

<script setup lang="ts">
import { NSelect, NButton } from "naive-ui";
import { SelectValue } from "@renderer/types";
import { useProviderStore } from "@renderer/stores/providers";
defineOptions({ name: "ProviderSelect" });

const { t } = useI18n();
const providerStore = useProviderStore();
const selectedProvider = defineModel<SelectValue>("modelValue");
const providerOptions = computed(() =>
  providerStore.allProviders
    .filter((item) => item.visible)
    .map((item) => ({
      label: item.title || item.name,
      type: "group",
      key: item.id,
      children: item.models.map((model) => ({
        label: model,
        value: `${item.id}:${model}`,
      })),
    }))
);
function openSettingWindow() {
  // todo
}
</script>

<style scoped>
.go-settings-btn {
  padding: 0, 0.5rem;
  font-weight: bold;
}
</style>
