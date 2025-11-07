<template>
  <div
    class="conversation-list px-2 pt-3 h-screen flex flex-col overflow-hidden"
    @contextmenu.prevent.stop="handleListContextMenu"
  >
    <search-bar class="mt-3"></search-bar>
    <ul class="flex-auto overflow-auto">
      <template v-for="item in conversations" :key="item.id">
        <li
          v-if="item.type !== 'divider'"
          class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2"
          @contextmenu.prevent.stop="handleItemContextMenu(item)"
        >
          <item-list v-bind="item" @update-title="updateTitle"></item-list>
        </li>
        <li v-else class="divider my-2 h-px bg-input"></li>
      </template>
    </ul>
    <operations-bar
      v-show="isBatchOperate"
      @select-all="handleAllSelectedChange"
      @cancel="isBatchOperate = false"
      @op="handleBatchOperate"
    ></operations-bar>
  </div>
</template>

<script setup lang="ts">
import OperationsBar from "./OperationsBar.vue";
import SearchBar from "./SearchBar.vue";
import ItemList from "./ItemList.vue";
import { useFilter } from "./useFilter";
import { CTX_KEY } from "./constants";
import { useContextMenu } from "./useContextMenu";
import { Conversation } from "@common/types";
import { useConversationStore } from "@renderer/stores/conversations";
import { createContextMenu } from "@renderer/utils/contextMenu";
import { CONVERSATION_ITEM_MENU_IDS, MENU_IDS } from "@common/constants";

defineOptions({ name: "ConversationList" });
const props = defineProps<{
  width: number;
}>();
const { conversations } = useFilter() as any;
const { handle: handleListContextMenu, isBatchOperate } = useContextMenu();
const conversationStore = useConversationStore();
const editId = ref<number | void>();
const checkedIds = ref<number[]>([]);
const conversationItemActionPolicy = new Map([
  [
    CONVERSATION_ITEM_MENU_IDS.DEL,
    async () => {
      console.log("item delete");
    },
  ],
  [
    CONVERSATION_ITEM_MENU_IDS.RENAME,
    async (item: Conversation) => {
      editId.value = item.id;
    },
  ],
  [
    CONVERSATION_ITEM_MENU_IDS.PIN,
    async (item: Conversation) => {
      if (item.pinned) {
        await conversationStore.unpinConversation(item.id);
      } else {
        await conversationStore.pinConversation(item.id);
      }
    },
  ],
]);

const batchActionPolicy = new Map([
  [
    CONVERSATION_ITEM_MENU_IDS.DEL,
    async () => {
      console.log("delete op");
    },
  ],
  [
    CONVERSATION_ITEM_MENU_IDS.PIN,
    async () => {
      checkedIds.value.forEach((id) => {
        if (
          conversationStore.allConversations.find((item) => item.id === id)
            ?.pinned
        ) {
          conversationStore.unpinConversation(id);
        } else {
          conversationStore.pinConversation(id);
        }
      });
      isBatchOperate.value = false;
    },
  ],
]);
async function handleItemContextMenu(item: Conversation) {
  const clickItem = (await createContextMenu(
    MENU_IDS.CONVERSATION_ITEM,
    void 0
  )) as CONVERSATION_ITEM_MENU_IDS;
  const action = conversationItemActionPolicy.get(clickItem);
  action && action(item);
}

function updateTitle(id: number, title: string) {
  const target = conversationStore.conversations.find((item) => item.id === id);
  if (!target) return;
  conversationStore.updateConversation({
    ...target,
    title,
  });
  editId.value = void 0;
}

function handleBatchOperate(opId: CONVERSATION_ITEM_MENU_IDS) {
  const action = batchActionPolicy.get(opId);
  action && action();
}

function handleAllSelectedChange(checked: boolean) {
  checkedIds.value = checked
    ? conversations.value.map((item: any) => item.id)
    : [];
}

// 依赖注入。便于子组件能够监听具体的操作以及数据
provide(CTX_KEY, {
  width: computed(() => props.width),
  editId: computed(() => editId.value),
  checkIds: checkedIds,
});
</script>

<style scoped>
::v-deep .flex-auto.overflow-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

::v-deep .flex-auto.overflow-auto::-webkit-scrollbar {
  display: none !important;
}
</style>
