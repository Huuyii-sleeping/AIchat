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
          <item-list v-bind="item"></item-list>
        </li>
        <li v-else class="divider my-2 h-px bg-input"></li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
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
const { handle: handleListContextMenu } = useContextMenu();
const conversationStore = useConversationStore();
const conversationItemActionPolicy = new Map([
  [
    CONVERSATION_ITEM_MENU_IDS.DEL,
    async () => {
      console.log("item delete");
    },
  ],
  [
    CONVERSATION_ITEM_MENU_IDS.RENAME,
    async () => {
      console.log("item rename");
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
async function handleItemContextMenu(item: Conversation) {
  const clickItem = (await createContextMenu(
    MENU_IDS.CONVERSATION_ITEM,
    void 0
  )) as CONVERSATION_ITEM_MENU_IDS;
  const action = conversationItemActionPolicy.get(clickItem);
  action && action(item);
}

// 依赖注入。便于子组件能够监听具体的操作以及数据
provide(CTX_KEY, {
  width: computed(() => props.width),
});
</script>

<style scoped></style>
