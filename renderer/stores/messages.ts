import type { Message, MessageStatus } from "@common/types";
import { dataBase } from "@renderer/dataBase";
import { cloneDeep, uniqueByKey } from "@common/utils";
import { useConversationStore } from "./conversations";
export const useMessageStore = defineStore("message", () => {
  const messages = ref<Message[]>([]);
  const allMessages = computed(() => messages.value);
  const messagesByConversationId = computed(() => (conversationId: number) => {
    return messages.value
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  });

  const conversationStore = useConversationStore();

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

    // 大模型回答
    // const loadingMessage = await addMessage({
    //   conversationId: message.conversationId,
    //   type: "answer",
    //   content: "",
    //   status: "loading",
    // });
    // TODO：调用大模型
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
