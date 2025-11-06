import { useConversationStore } from "@renderer/stores/conversations";

const searchKey = ref("");
// const _searchKey = ref("");

export function useFilter() {
  const conversationStore = useConversationStore();
  const filteredConversations = computed(() => {
    // todo filter操作
    return conversationStore.allConversations;
  });
  return {
    searchKey,
    conversations: filteredConversations,
  };
}
