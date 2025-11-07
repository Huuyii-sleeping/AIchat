<template>
  <div
    class="conversation-desc text-tx-secondary flex justify-between items-center text-sm loading-5"
  >
    <span>{{ selectedModel }}</span>
    <iconify-icon
      class="inline-block"
      v-if="pinned"
      icon="material-symbols:keep-rounded"
      :height="_PIN_ICON_SIZE"
      :width="_PIN_ICON_SIZE"
    ></iconify-icon>
  </div>
  <div class="w-full flex items-center" v-if="isBatchOperate">
    <n-checkbox
      :style="_CHECKBOX_STYLE_FIX"
      v-model:checked="checked"
      @click.stop
    ></n-checkbox>
    <div class="flex-auto">
      <item-title
        :title="title"
        :is-editable="isTitleEditable"
        @update-title="updateTitle"
      ></item-title>
    </div>
  </div>
  <item-title
    v-else
    :title="title"
    :is-editable="isTitleEditable"
    @update-title="updateTitle"
  ></item-title>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from "@iconify/vue";
import { NCheckbox } from "naive-ui";
import { Conversation } from "@common/types";
import ItemTitle from "./ItemTitle.vue";
import { CTX_KEY } from "./constants";
import { useContextMenu } from "./useContextMenu";

defineOptions({ name: "ConversationListItem" });
const props = defineProps<Conversation>();
const ctx = inject(CTX_KEY, void 0);
const checked = ref(false);
const emit = defineEmits(["updateTitle"]);
const isTitleEditable = computed(() => ctx?.editId.value === props.id);
const _PIN_ICON_SIZE = 16 as const;
const _CHECKBOX_STYLE_FIX = {
  translate: "-5px -1px",
  marginLeft: "5px",
};
const { isBatchOperate } = useContextMenu();

function updateTitle(val: string) {
  emit("updateTitle", props.id, val);
}

// 监听内部check和外部check的变化，当有变化的时候就进行对应的操作
watch(checked, (val) => {
  if (val) {
    !ctx?.checkIds.value.includes(props.id) &&
      ctx?.checkIds.value.push(props.id);
  } else {
    const idx = ctx?.checkIds.value.indexOf(props.id);
    if (idx !== -1 && idx !== null && idx !== undefined) {
      ctx?.checkIds.value.splice(idx, 1);
    }
  }
});

watch(
  () => ctx?.checkIds.value,
  (val) => {
    if (!val) return;
    checked.value = val.includes(props.id);
  }
);
</script>

<style scoped></style>
