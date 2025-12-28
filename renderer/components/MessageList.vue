<template>
  <div class="flex flex-col h-full">
    <n-scrollbar class="message-list px-5 pt-6">
      <div
        class="message-list-item mt-3 pb-5 flex items-center"
        v-for="message in messages"
        :key="message.id"
      >
        <div class="pr-5" v-show="isBatchMode">
          <!-- todo 多选框 -->
          <n-checkbox
            :checked="itemChecked(message.id)"
            @update:checked="handleCheckItem(message.id, $event)"
          ></n-checkbox>
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
              @contextmenu="handleContextMenu(message.id)"
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
              @contextmenu="handleContextMenu(message.id)"
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
    <div
      v-show="isBatchMode"
      class="flex justify-between p-2 border-t-3 border-input"
    >
      <n-button type="error" size="tiny" @click="handleBatchDelete()">{{
        t("main.message.batchActions.deleteSelected")
      }}</n-button>
      <n-button type="primary" size="tiny" quaternary @click="quitBatchMode">{{
        t("dialog.cancel")
      }}</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NScrollbar, useMessage, NCheckbox, NButton } from "naive-ui";
import type { Message } from "@common/types";
import MessageRender from "./MessageRender.vue";
import { useBatchTimeAgo } from "@renderer/hooks/useTimeAgo";
import { MENU_IDS, MESSAGE_ITEM_MENU_IDS } from "@common/constants";
import { createContextMenu } from "@renderer/utils/contextMenu";
import { useMessageStore } from "@renderer/stores/messages";
import useDialog from "@renderer/hooks/useDialog";
defineOptions({ name: "MessageList" });
const props = defineProps<{
  messages: Message[];
}>();
const { formatTimeAgo } = useBatchTimeAgo();
const MESSAGE_LIST_CLASS_NAME = "message-list";
const SCROLLBAR_CONTENT_CLASS_NAME = "n-scrollbar-content";

// select 内容
const isBatchMode = ref(false);
const checkedIds = ref<number[]>([]);
const itemChecked = computed(
  () => (msgId: number) => checkedIds.value.includes(msgId)
);

const route = useRoute();
const message = useMessage();
const { t } = useI18n();
const { createDialog } = useDialog();
const { deleteMessage } = useMessageStore();

const messageActionPolicy = new Map<
  MESSAGE_ITEM_MENU_IDS,
  (msgId: number) => Promise<void>
>([
  [
    MESSAGE_ITEM_MENU_IDS.COPY,
    async (msgId) => {
      const msg = props.messages.find((msg) => msg.id === msgId);
      if (!msg) return;
      navigator.clipboard.writeText(msg.content).then(() => {
        message.success(t("main.message.dialog.copySuccess"));
      });
    },
  ],
  [
    MESSAGE_ITEM_MENU_IDS.SELECT,
    async (msgId) => {
      checkedIds.value = [...checkedIds.value, msgId];
      isBatchMode.value = true;
    },
  ],
  [
    MESSAGE_ITEM_MENU_IDS.DELETE,
    async (msgId) => {
      const res = (await createDialog({
        title: t("main.message.dialog.title"),
        content: t("main.message.dialog.messageDelete"),
      })) as any;
      if (res === "confirm") {
        deleteMessage(msgId);
      }
    },
  ],
]);

async function handleContextMenu(msgId: number) {
  const clickItem = await createContextMenu(MENU_IDS.MESSAGE_ITEM);
  const action = messageActionPolicy.get(clickItem as MESSAGE_ITEM_MENU_IDS);
  action && (await action(msgId));
}

function handleCheckItem(id: number, val: boolean) {
  if (val && !checkedIds.value.includes(id)) {
    checkedIds.value = [...checkedIds.value, id];
  } else {
    checkedIds.value = checkedIds.value.filter((_id) => _id !== id);
  }
}

async function handleBatchDelete() {
  const res = await createDialog({
    title: "main.message.dialog.title",
    content: "main.message.dialog.batchDelete",
  });
  if (res === "confirm") {
    checkedIds.value.forEach((id) => deleteMessage(id));
    quitBatchMode();
  }
}

function quitBatchMode() {
  isBatchMode.value = false;
  checkedIds.value = [];
}

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
