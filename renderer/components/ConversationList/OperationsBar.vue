<template>
  <div @click.stop>
    <p class="divider my-2 h-px bg-input"></p>
    <div class="flex justify-between items-center pt-1">
      <n-checkbox
        v-model:checked="isAllSelected"
        @update-checked="handleSelectedChange"
      >
        {{ t("main.conversation.operations.selectAll") }}
      </n-checkbox>
      <n-button quaternary @click="emits('cancel')">
        {{ t("main.conversation.operations.cancel") }}
      </n-button>
    </div>
    <div class="flex items-center py-4">
      <n-button
        class="flex-1"
        style="margin-right: 2px"
        @click="emits('op', CONVERSATION_ITEM_MENU_IDS.PIN)"
      >
        {{ t("main.conversation.operations.pin") }}
      </n-button>
      <n-button
        class="flex-1"
        @click="emits('op', CONVERSATION_ITEM_MENU_IDS.DEL)"
      >
        {{ t("main.conversation.operations.del") }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCheckbox } from "naive-ui";
import { CONVERSATION_ITEM_MENU_IDS } from "@common/constants";
import { CTX_KEY } from "./constants";
import { useContextMenu } from "./useContextMenu";
import { useFilter } from "./useFilter";
defineOptions({ name: "OperationsBar" });
const { t } = useI18n();
const emits = defineEmits(["cancel", "selectAll", "op"]);
const ctx = inject(CTX_KEY, void 0);
const { isBatchOperate } = useContextMenu();
const { conversations } = useFilter();
const isAllSelected = ref(false);

function handleSelectedChange(checked: boolean) {
  isAllSelected.value = checked;
  emits("selectAll", checked);
}

watch(
  () => isBatchOperate.value,
  () => {
    handleSelectedChange(false);
  }
);

watch(
  [() => ctx?.checkIds.value.length, () => conversations.value.length],
  ([checkIdsSize, conversationSize]) => {
    isAllSelected.value = checkIdsSize === conversationSize;
  }
);
</script>

<style scoped></style>
