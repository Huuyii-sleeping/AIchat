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
defineOptions({ name: "ConversationList" });
const { conversations } = useFilter();
</script>

<style scoped></style>
