import {
  MENU_IDS,
  CONVERSATION_LIST_MENU_IDS,
} from "@common/constants";
import { createContextMenu } from "@renderer/utils/contextMenu";
import { useConversationStore } from "@renderer/stores/conversations";

const sortByMap = new Map([
  ["createdAt", CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME],
  ["updatedAt", CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME],
  ["name", CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME],
  ["model", CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL],
]);

const sortOrderMap = new Map([
  ["desc", CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING],
  ["asc", CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING],
]);

export function useContextMenu() {
  const router = useRouter();
  const route = useRoute();
  const conversationStore = useConversationStore();

  // 对于不同的操作进行map映射
  const actionPolicy = new Map([
    [
      CONVERSATION_LIST_MENU_IDS.BATCH_OPERATIONS,
      () => {
        console.log("batch operations");
      },
    ],
    [
      CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION,
      () => {
        console.log("new conversation");
        router.push("/conversation");
      },
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME,
      () =>
        conversationStore.setSortMode("createdAt", conversationStore.sortOrder),
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME,
      () =>
        conversationStore.setSortMode("updatedAt", conversationStore.sortOrder),
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME,
      () => conversationStore.setSortMode("name", conversationStore.sortOrder),
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL,
      () => conversationStore.setSortMode("model", conversationStore.sortOrder),
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING,
      () => conversationStore.setSortMode(conversationStore.sortBy, "desc"),
    ],
    [
      CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING,
      () => conversationStore.setSortMode(conversationStore.sortBy, "asc"),
    ],
  ]);

  const handle = async () => {
    const { sortBy, sortOrder } = conversationStore.sortMode;
    const sortById = sortByMap.get(sortBy) ?? "";
    const sortOrderId = sortOrderMap.get(sortOrder) ?? "";
    const newConversationEnabled = !!route.params.id;
    const item = await createContextMenu(MENU_IDS.CONVERSATION_LIST, void 0, [
      {
        id: CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION,
        enabled: newConversationEnabled,
      },
      { id: sortById, checked: true },
      { id: sortOrderId, checked: true },
    ]);
    const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
    action?.();
  };

  return {
    handle,
  };
}
