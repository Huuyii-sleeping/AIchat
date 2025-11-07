<template>
  <span>{{ content }}</span>
</template>

<script setup lang="ts">
defineOptions({ name: "messageRender" });
defineProps<{
  msgId: number;
  content: string;
  isStreaming: boolean;
}>();
</script>

<style scoped></style>
