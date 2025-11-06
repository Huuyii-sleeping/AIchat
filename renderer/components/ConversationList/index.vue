<template>
  <div
    class="conversation-list px-2 pt-3 h-screen flex flex-col overflow-hidden"
  >
    <search-bar class="mt-3"></search-bar>
    <ul class="flex-auto overflow-auto">
      <template v-for="item in conversations" :key="item.id">
        <li
          v-if="item.type !== 'divider'"
          class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2"
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
defineOptions({ name: "ConversationList" });
const { conversations } = useFilter();
const props = defineProps<{
  width: number;
}>();

// 依赖注入。便于子组件能够监听具体的操作以及数据
provide(CTX_KEY, {
  width: computed(() => props.width),
});
</script>

<style scoped></style>
