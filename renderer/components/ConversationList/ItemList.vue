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
  <div class="w-full flex items-center">
    <!-- todo 复选框展示 -->
    <!-- <div class="flex-auto"> -->
    <item-title :title="title"></item-title>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from "@iconify/vue";
import { Conversation } from "@common/types";
import ItemTitle from "./ItemTitle.vue";

defineOptions({ name: "ConversationListItem" });
defineProps<Conversation>();
const emit = defineEmits(["updateTitle"]);

const _PIN_ICON_SIZE = 16 as const;
</script>

<style scoped></style>
