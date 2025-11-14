import type { Message, MessageStatus } from "@common/types";
import { dataBase } from "@renderer/dataBase";
import { cloneDeep, uniqueByKey } from "@common/utils";
import { useConversationStore } from "./conversations";
import { useProviderStore } from "./providers";
import { listenDialogueBack } from "@renderer/utils/dialogue";

const messageContenetMap = new Map<number, string>();
export const stopMethods = new Map<number, () => void>();

export const useMessageStore = defineStore("message", () => {
  const messages = ref<Message[]>([]);
  const allMessages = computed(() => messages.value);
  const messagesByConversationId = computed(() => (conversationId: number) => {
    return messages.value
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  });

  const conversationStore = useConversationStore();
  const providerStore = useProviderStore();

  async function initialize(conversationId: number) {
    if (!conversationId) return;

    const isConversationLoaded = messages.value.some(
      (messages) => messages.conversationId === conversationId
    );
    if (isConversationLoaded) return;
    const saved = await dataBase.messages.where({ conversationId }).toArray();
    messages.value = uniqueByKey([...messages.value, ...saved], "id");
  }

  const _updateConversation = async (conversationId: number) => {
    const conversation = await dataBase.conversations.get(conversationId);
    conversation && conversationStore.updateConversation(conversation);
  };

  async function addMessage(message: Omit<Message, "id" | "createdAt">) {
    const newMessage = {
      ...message,
      createdAt: Date.now(),
    };
    const id = await dataBase.messages.add(newMessage);
    _updateConversation(newMessage.conversationId);
    messages.value.push({ ...newMessage, id });
    return id;
  }

  async function sendMessage(message: Omit<Message, "id" | "createdAt">) {
    await addMessage(message);

    const loadingMsgId = await addMessage({
      conversationId: message.conversationId,
      type: "answer",
      content: "",
      status: "loading",
    });

    const conversation = conversationStore.getConversationById(
      message.conversationId
    );

    if (!conversation) return loadingMsgId;

    const provider = providerStore.allProviders.find(
      (item) => item.id === conversation.providerId
    );

    if (!provider) return loadingMsgId;

    messageContenetMap.set(loadingMsgId, "");

    let streamCallback:
      | ((stream: DialogueBackStream) => Promise<void>)
      | void = async (stream) => {
      const { data, messageId } = stream;
      const getStatus = (data: DialogueBackStream["data"]): MessageStatus => {
        if (data.isError) return "error";
        if (data.isEnd) return "success";
        return "streaming";
      };
      messageContenetMap.set(
        messageId,
        messageContenetMap.get(messageId) + data.result
      );

      const _update = {
        content: messageContenetMap.get(messageId) || "",
        status: getStatus(data),
        updatedAt: Date.now(),
      } as Message;

      await nextTick();
      updateMessage(messageId, _update);
      if (data.isEnd) {
        messageContenetMap.delete(messageId);
        streamCallback = void 0;
      }
    };
    stopMethods.set(
      loadingMsgId,
      listenDialogueBack(streamCallback, loadingMsgId) as any
    );
    const messages = messagesByConversationId
      .value(message.conversationId)
      .filter((item) => item.status !== "loading")
      .map((item) => ({
        role:
          item.type === "question"
            ? "user"
            : ("assistant" as DialogueMessageRole),
        content: item.content,
      }));

    await window.api.startADialogue({
      messageId: loadingMsgId,
      providerName: provider.name,
      selectedModel: conversation.selectedModel,
      conversationId: message.conversationId,
      messages,
    });

    return loadingMsgId;
  }

  async function updateMessage(id: number, updates: Partial<Message>) {
    let currentMsg = cloneDeep(
      messages.value.find((message) => message.id === id)
    );
    await dataBase.messages.update(id, { ...currentMsg, ...updates });
    messages.value = messages.value.map((message) =>
      message.id === id ? { ...message, ...updates } : message
    );
  }

  async function deleteMessage(id: number) {
    let currentMsg = cloneDeep(messages.value.find((item) => item.id === id));
    // TODO stop 当大模型回复的时候需要stop
    await dataBase.messages.delete(id);
    currentMsg && _updateConversation(currentMsg.conversationId);
    messages.value = messages.value.filter((messages) => messages.id !== id);
    currentMsg = void 0;
  }

  return {
    messages,
    allMessages,
    messagesByConversationId,
    initialize,
    addMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
});
