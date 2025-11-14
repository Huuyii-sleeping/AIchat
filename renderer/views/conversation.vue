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
        v-model:provider="provider"
        :placeholder="$t('main.conversation.placeholder')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MAIN_WIN_SIZE } from "@common/constants";
import { throttle } from "@common/utils";
import { SelectValue } from "@renderer/types";
import CreateConversation from "@renderer/components/CreateConversation.vue";
import MessageInput from "@renderer/components/MessageInput.vue";
import ResizeDivider from "@renderer/components/ResizeDivider.vue";
import MessageList from "@renderer/components/MessageList.vue";
import { useMessageStore } from "@renderer/stores/messages";
import { useConversationStore } from "@renderer/stores/conversations";
import { useProviderStore } from "@renderer/stores/providers";
import { messages } from "@renderer/testData";

const router = useRouter();
const route = useRoute();
const conversationStore = useConversationStore();
const messageStore = useMessageStore();
const providerStore = useProviderStore();
const { t } = useI18n();
const listHeight = ref(0);
const listScale = ref(0.7);
const maxListHeight = ref(window.innerHeight * 0.7);
const isStoping = ref(false);
const message = ref("");
const provider = ref<SelectValue>();
const msgInputRef = useTemplateRef<{ selectProvider: SelectValue }>(
  "msgInputRef"
);
const providerId = computed(
  () => (provider.value as string)?.split(":")[0] ?? ""
);
const selectedModel = computed(
  () => (provider.value as string)?.split(":")[1] ?? ""
);
const conversationId = computed(
  () => Number(route.params.id) as Number | undefined
);

async function handleCreateConversation(
  create: (title: string) => Promise<number | void>,
  _message: string
) {
  const id = await create(_message);
  if (!id) return;
  afterCreateConversation(id, _message);
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
  // conversationStore.setSortMode
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
</script>

<style scoped>
.input-container {
  box-shadow: 5px 1px 20px 0px rgba(101, 101, 101, 0.2);
}
</style>
