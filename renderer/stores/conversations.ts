import { Conversation } from "@common/types";
import { debounce } from "@common/utils";
import { dataBase } from "@renderer/dataBase";

type SortBy = "updatedAt" | "createdAt" | "name" | "model";
type SortOrder = "asc" | "desc";

const SORT_BY_KEY = "conversation:sortBy";
const SORT_ORDER_KEY = "conversation:sortOrder";

const saveSortModel = debounce(
  ({ sortBy, sortOrder }: { sortBy: SortBy; sortOrder: SortOrder }) => {
    localStorage.setItem(SORT_BY_KEY, sortBy);
    localStorage.setItem(SORT_ORDER_KEY, sortOrder);
  },
  300
);

export const useConversationStore = defineStore("conversations", () => {
  const conversations = ref<Conversation[]>([]);
  const saveSortBy = localStorage.getItem(SORT_BY_KEY) as SortBy;
  const saveSortOrder = localStorage.getItem(SORT_ORDER_KEY) as SortOrder;
  const sortBy = ref<SortBy>(saveSortBy ?? "createdAt");
  const sortOrder = ref<SortOrder>(saveSortOrder ?? "desc");

  const allConversations = computed(() => conversations.value);
  const sortMode = computed(() => ({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }));

  async function initialize() {
    conversations.value = await dataBase.conversations.toArray();

    // 清除无用的message
    const ids = conversations.value.map((item) => item.id);
    const msgs = await dataBase.message.toArray();
    const invalidId = msgs
      .filter((item) => !ids.includes(item.conversationId))
      .map((item) => item.id);
    invalidId.length && dataBase.message.where("id").anyOf(invalidId).delete();
  }

  function setSortMode(_sortBy: SortBy, _sortOrder: SortOrder) {
    if (sortBy.value !== _sortBy) {
      sortBy.value = _sortBy;
    }
    if (sortOrder.value !== _sortOrder) {
      sortOrder.value = _sortOrder;
    }
  }

  function getConversationById(id: number) {
    return conversations.value.find(
      (item) => item.id === id
    ) as Conversation | void;
  }

  async function addConversation(conversation: Omit<Conversation, "id">) {
    const conversationWidthPin = {
      ...conversation,
      pinned: conversation.pinned ?? false,
    };
    const conversationId =
      await dataBase.conversations.add(conversationWidthPin);
    conversations.value.push({
      id: conversationId,
      ...conversationWidthPin,
    });
    return conversationId;
  }

  async function deleteConversation(id: number) {
    await dataBase.message.where("conversationId").equals(id).delete();
    await dataBase.conversations.delete(id);
    conversations.value = conversations.value.filter((item) => item.id !== id);
  }

  async function updateConversation(
    conversation: Conversation,
    updateTime: boolean = true
  ) {
    const _newConversation = {
      ...conversation,
      updatdeAt: updateTime ? Date.now() : conversation.updatedAt,
    };
    await dataBase.conversations.update(conversation.id, _newConversation);
    conversations.value = conversations.value.map((item) =>
      item.id === conversation.id ? _newConversation : item
    );
  }

  async function pinConversation(id: number) {
    const conversation = conversations.value.find((item) => item.id === id);
    if (!conversation) return;
    await updateConversation(
      {
        ...conversation,
        pinned: true,
      },
      false
    );
  }

  async function unpinConversation(id: number) {
    const conversation = conversations.value.find((item) => item.id === id);
    if (!conversation) return;
    await updateConversation(
      {
        ...conversation,
        pinned: false,
      },
      false
    );
  }

  watch([() => sortBy.value, () => sortOrder.value], () =>
    saveSortModel({
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    })
  );

  return {
    conversations,
    allConversations,
    sortBy,
    sortOrder,
    sortMode,
    initialize,
    setSortMode,
    getConversationById,
    addConversation,
    deleteConversation,
    updateConversation,
    pinConversation,
    unpinConversation,
  };
});
