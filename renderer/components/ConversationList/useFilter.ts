import { Conversation } from "@common/types";
import { debounce } from "@common/utils";
import { useConversationStore } from "@renderer/stores/conversations";

const searchKey = ref("");
const _searchKey = ref("");

export function useFilter() {
  const conversationStore = useConversationStore();
  const sortedConversations = computed(() => {
    const { sortBy, sortOrder } = conversationStore.sortMode;

    const divider = Object.freeze({
      type: "divider",
      id: -1,
    }) as Conversation;

    const pinned: Conversation[] = conversationStore.allConversations
      .filter((conversation) => conversation.pinned)
      .map((item) => ({ type: "conversation", ...item }));
    if (pinned.length) {
      pinned.push(divider);
    }

    const unpinned: Conversation[] = conversationStore.allConversations
      .filter((item) => !item.pinned)
      .map((item) => ({ type: "conversation", ...item }));

    const handleSortOrder = <T = number | string>(a?: T, b?: T) => {
      if (typeof a === "number" && typeof b === "number") {
        return sortOrder === "desc" ? b - a : a - b;
      }
      if (typeof a === "string" && typeof b === "string") {
        return sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b);
      }
      return 0;
    };
    if (sortBy === "createdAt") {
      return [
        ...pinned.sort((a, b) => handleSortOrder(a.createdAt, b.createdAt)),
        ...unpinned.sort((a, b) => handleSortOrder(a.createdAt, b.createdAt)),
      ];
    } else if (sortBy === "updatedAt") {
      return [
        ...pinned.sort((a, b) => handleSortOrder(a.updatedAt, b.updatedAt)),
        ...unpinned.sort((a, b) => handleSortOrder(a.updatedAt, b.updatedAt)),
      ];
    } else if (sortBy === "name") {
      return [
        ...pinned.sort((a, b) => handleSortOrder(a.title, b.title)),
        ...unpinned.sort((a, b) => handleSortOrder(a.title, b.title)),
      ];
    } else if (sortBy === "model") {
      return [
        ...pinned.sort((a, b) =>
          handleSortOrder(a.selectedModel, b.selectedModel)
        ),
        ...unpinned.sort((a, b) =>
          handleSortOrder(a.selectedModel, b.selectedModel)
        ),
      ];
    }

    return conversationStore.allConversations;
  });

  const filterConversation = computed(() => {
    if (!_searchKey.value) return sortedConversations;
    return sortedConversations.value.filter(
      (item) => item?.title && item?.title.includes(_searchKey.value)
    );
  });

  const updateSearchKey = debounce((val) => {
    _searchKey.value = val;
  }, 200);

  watch(
    () => searchKey,
    (val) => {
      updateSearchKey(val);
    }
  );

  return {
    searchKey,
    conversations: filterConversation,
  };
}
