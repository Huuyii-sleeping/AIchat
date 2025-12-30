<template>
  <div class="h-full" v-if="!conversationId">
    <div class="h-full pt-[45vh] px-5">
      <div class="text-3xl font-bold text-primary-subtle text-center">
        {{ $t("main.welcome.helloMessage") }}
      </div>

      <div
        class="bg-bubble-others mt-6 max-w-[800px] h-[200px] mx-auto rounded-md"
      >
        <create-conversation
          :providerId="providerId"
          :selectedModel="selectedModel"
          v-slot="{ create }"
        >
          <message-input
            v-model:message="message"
            v-model:provider="provider"
            :placeholder="$t('main.conversation.placeholder')"
            @send="handleCreateConversation(create, message)"
          />
        </create-conversation>
      </div>
    </div>
  </div>
  <div class="h-full flex flex-col" v-else>
    <div class="w-full min-h-0" :style="{ height: `${listHeight}px` }">
      <message-list
        :messages="
          messageStore.messagesByConversationId(conversationId as number)
        "
      />
    </div>
    <div
      class="input-container bg-bubble-others flex-auto w-[calc(100% + 10px)] ml-[-5px]"
    >
      <resize-divider
        direction="horizontal"
        v-model:size="listHeight"
        :max-size="maxListHeight"
        :min-size="100"
      />
      <message-input
        class="p-2 pt-0"
        ref="msgInputRef"
        :message="messageStore.messageInputValueById(conversationId ?? -1)"
        :status="messageinputStatus"
        v-model:provider="provider"
        :placeholder="$t('main.conversation.placeholder')"
        @update:message="
          messageStore.setMessageInputValue(conversationId ?? -1, $event)
        "
        @send="handleSendMessage"
        @select="handleProviderSelect"
        @stop="handleStopMessage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CONFIG_KEYS, MAIN_WIN_SIZE } from "@common/constants";
import { throttle } from "@common/utils";
import { SelectValue } from "@renderer/types";
import CreateConversation from "@renderer/components/CreateConversation.vue";
import MessageInput from "@renderer/components/MessageInput.vue";
import ResizeDivider from "@renderer/components/ResizeDivider.vue";
import MessageList from "@renderer/components/MessageList.vue";
import { useMessageStore } from "@renderer/stores/messages";
import { useConversationStore } from "@renderer/stores/conversations";
import { useProviderStore } from "@renderer/stores/providers";
import useConfig from "@renderer/hooks/useConfig";

const router = useRouter();
const route = useRoute();
const config = useConfig();
const conversationStore = useConversationStore();
const messageStore = useMessageStore();
const providerStore = useProviderStore();
const listHeight = ref(0);
const listScale = ref(0.7);
const maxListHeight = ref(window.innerHeight * 0.7);
const isStoping = ref(false);
const message = ref("");
const provider = ref<SelectValue>();
const msgInputRef = useTemplateRef<{ selectedProvider: SelectValue }>(
  "msgInputRef"
);
const canUpdateConversationTime = ref(true);

const providerId = computed(
  () => (provider.value as string)?.split(":")[0] ?? ""
);
const selectedModel = computed(
  () => (provider.value as string)?.split(":")[1] ?? ""
);
const conversationId = computed(
  () => Number(route.params.id) as undefined | number
);

const defaultModel = computed(() => {
  const vals: string[] = [];
  providerStore.allProviders.forEach((provider) => {
    if (!provider.visible) return;
    provider.models.forEach((model) => {
      vals.push(`${provider.id}:${model}`);
    });
  });
  if (!vals.includes(config[CONFIG_KEYS.DEFAULT_MODEL] ?? "")) return null;
  return config[CONFIG_KEYS.DEFAULT_MODEL] || null;
});

const messageinputStatus = computed(() => {
  if (isStoping.value) return "loading";
  const messages = messageStore.messagesByConversationId(
    conversationId.value as number
  );
  const last = messages[messages.length - 1];
  if (last?.status === "streaming" && last?.content?.length === 0)
    return "loading";
  if (last?.status === "loading" || last?.status === "streaming")
    return last?.status;
  return "normal";
});

async function handleCreateConversation(
  create: (title: string) => Promise<number | void>,
  _message: string
) {
  const id = await create(_message);
  if (!id) return;
  afterCreateConversation(id, _message);
}

async function handleSendMessage() {
  if (!conversationId.value) return;
  const _conversationId = conversationId.value;
  const content = messageStore.messageInputValueById(_conversationId);
  if (!content?.trim()?.length) return;
  messageStore.sendMessage({
    type: "question",
    content,
    conversationId: _conversationId,
  });
  messageStore.setMessageInputValue(_conversationId, "");
}

async function handleStopMessage() {
  isStoping.value = true;
  const msgIds = messageStore.loadingMsgIdsByConversationId(
    (conversationId.value as number) ?? -1
  );

  for (const id of msgIds) {
    messageStore.stopMessage(id);
  }
  isStoping.value = false;
}

function handleProviderSelect() {
  if (!conversationId.value) return;
  const current = conversationStore.getConversationById(conversationId.value);
  if (!current) return;
  // 触发模型的变化
  conversationStore.updateConversation(
    {
      ...current,
      providerId: Number(providerId.value),
      selectedModel: selectedModel.value,
    },
    canUpdateConversationTime.value
  );
}

function afterCreateConversation(id: number, firstMsg: string) {
  if (!id) return;
  router.push(`/conversation/${id}`);
  messageStore.sendMessage({
    type: "question",
    content: firstMsg,
    conversationId: id,
  });
  message.value = "";
  messageStore.setMessageInputValue(id, "");
}

window.onresize = throttle(async () => {
  if (window.innerHeight < MAIN_WIN_SIZE.minHeight) return;
  listHeight.value = window.innerHeight * listScale.value;
  await nextTick();
  maxListHeight.value = window.innerHeight * 0.7;
  if (listHeight.value > maxListHeight.value)
    listHeight.value = maxListHeight.value;
}, 40);

onMounted(async () => {
  await nextTick();
  listHeight.value = window.innerHeight * listScale.value;
});

onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.id === from.params.id) return next();
  await messageStore.initialize(Number(to.params.id));
  next();
});

watch(
  () => listHeight.value,
  () => (listScale.value = listHeight.value / window.innerHeight)
);

watch(
  [() => conversationId.value, () => msgInputRef.value],
  async ([id, msgInput]) => {
    if (!msgInput || !id) {
      provider.value = defaultModel.value
      return;
    }

    const current = conversationStore.getConversationById(id);
    if (!current) return;
    canUpdateConversationTime.value = false;
    provider.value = `${current.providerId}:${current.selectedModel}`;
    await nextTick();
    canUpdateConversationTime.value = true;

    message.value = "";
  }
);
</script>

<style scoped>
.input-container {
  box-shadow: 5px 1px 20px 0px rgba(101, 101, 101, 0.2);
}
</style>
