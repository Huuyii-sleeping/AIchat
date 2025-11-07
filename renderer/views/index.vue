<template>
  <div class="main-view h-full w-full flex flex-col">
    <title-bar>
      <drag-region class="w-full"></drag-region>
    </title-bar>
    <main class="flex-auto">
      <!-- <router-view></router-view> -->
      <create-conversation
        :providerId="providerId"
        :selectedModel="selectedModel"
        v-slot="{ create }"
      >
        <message-input
          v-model:message="message"
          v-model:provider="provider"
          :placeholder="t('main.conversation.placeholder')"
          @send="handleCreateConversation(create, message)"
        />
      </create-conversation>
    </main>
  </div>
</template>

<script setup lang="ts">
import MessageInput from "@renderer/components/MessageInput.vue";
import { SelectValue } from "@renderer/types";
import CreateConversation from "@renderer/components/CreateConversation.vue";
const { t } = useI18n();
const message = ref("");
const provider = ref<SelectValue>();
const providerId = computed(
  () => (provider.value as string)?.split(":")[0] ?? ""
);
const selectedModel = computed(
  () => (provider.value as string)?.split(":")[1] ?? ""
);
async function handleCreateConversation(
  create: (title: string) => Promise<number | void>,
  _message: string
) {
  const id = await create(_message);
  if (!id) return;
  // todo
  // afterCreateConversation(id, _message);
}
</script>

<style scoped></style>
