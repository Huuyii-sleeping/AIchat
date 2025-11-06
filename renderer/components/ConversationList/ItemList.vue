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
    <div class="flex-auto">
      <h2
        class="conversation-title w-full text-tx-secondary font-semibold loading-5 truncate"
      >
        {{ title }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from "@iconify/vue";
import { Conversation } from "@common/types";

defineOptions({ name: "ConversationListItem" });
defineProps<Conversation>();
const emit = defineEmits(["updateTitle"]);

const _PIN_ICON_SIZE = 16 as const;
</script>

<style scoped></style>
