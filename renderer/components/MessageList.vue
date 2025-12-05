<template>
  <div class="flex flex-col h-full">
    <n-scrollbar class="message-list px-5 pt-6">
      <div
        class="message-list-item mt-3 pb-5 flex items-center"
        v-for="message in messages"
        :key="message.id"
      >
        <div class="pr-5" v-show="false">
          <!-- todo 多选框 -->
        </div>
        <div
          class="flex flex-auto"
          :class="{
            'justify-end': message.type === 'question',
            'justify-start': message.type === 'answer',
          }"
        >
          <span>
            <div
              class="text-sm text-gray-500 mb-2"
              :style="{
                textAlign: message.type === 'question' ? 'end' : 'start',
              }"
            >
              <!-- todo timeAgo -->
              {{ formatTimeAgo(message.createdAt) }}
            </div>
            <div
              class="key-shadow p-2 rounded-md bg-bubble-self text-white"
              v-if="message.type === 'question'"
            >
              <message-render
                :msg-id="message.id"
                :content="message.content"
                :is-streaming="message.status === 'streaming'"
              ></message-render>
            </div>
            <div
              v-else
              class="msg-shadow p-2 px-6 rounded-md bg-bubble-others"
              :class="{
                'bg-bubble-others': message.status !== 'error',
                'text-tx-primary': message.status !== 'error',
                'text-red-300': message.status === 'error',
                'font-bold': message.status === 'error',
              }"
            >
              <template v-if="message.status === 'loading'">...</template>
              <template v-else>
                <message-render
                  :msg-id="message.id"
                  :content="message.content"
                  :is-streaming="message.status === 'streaming'"
                ></message-render>
              </template>
            </div>
          </span>
        </div>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { NScrollbar } from "naive-ui";
import type { Message } from "@common/types";
import MessageRender from "./MessageRender.vue";
import { useBatchTimeAgo } from "@renderer/hooks/useTimeAgo";
defineOptions({ name: "MessageList" });
const props = defineProps<{
  messages: Message[];
}>();
const { formatTimeAgo } = useBatchTimeAgo();
const MESSAGE_LIST_CLASS_NAME = "message-list";
const SCROLLBAR_CONTENT_CLASS_NAME = "n-scrollbar-content";
const route = useRoute();

function _getScrollDOM() {
  const messageListDOM = document.getElementsByClassName(
    MESSAGE_LIST_CLASS_NAME
  )[0];
  if (!messageListDOM) {
    return;
  }
  return messageListDOM.getElementsByClassName(SCROLLBAR_CONTENT_CLASS_NAME)[0];
}

async function scrollToBottom(
  behavior: ScrollIntoViewOptions["behavior"] = "smooth"
) {
  await nextTick();
  const scrollDOM = _getScrollDOM();
  if (!scrollDOM) return;
  scrollDOM.scrollIntoView({
    behavior,
    block: "end",
  });
}

let currentHeight = 0;
watch([() => route.params.id, () => props.messages.length], () => {
  scrollToBottom("instant");
  currentHeight = 0;
});

watch(
  () => props.messages[props.messages.length - 1]?.content?.length,
  () => {
    const scrollDOM = _getScrollDOM();
    if (!scrollDOM) return;
    const height = scrollDOM.scrollHeight;
    if (height > currentHeight) {
      currentHeight = height;
      scrollToBottom();
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  scrollToBottom("instant");
});
</script>
<style scoped>
.msg-shadow {
  box-shadow: 0 0 10px var(--input-bg);
}
</style>
