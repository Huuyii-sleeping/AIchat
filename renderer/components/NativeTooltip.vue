<template>
  <template v-if="slots.default()[0].el">
    <slot></slot>
  </template>
  <template v-else>
    <span :title="content">
      <slot></slot>
    </span>
  </template>
</template>

<script setup lang="ts">
import logger from "@renderer/utils/logger";

defineOptions({ name: "NativeTooltip" });
interface props {
  content: string;
}

const props = defineProps<props>();
const slots = defineSlots();

if (slots?.default?.().length > 1) {
  logger.warn("NativeTooltip only support one slot");
}

function updateTooltip(content: string) {
  const defaultSlot = slots?.default?.();
  if (defaultSlot) {
    const slotElement = defaultSlot[0]?.el;
    if (slotElement && slotElement instanceof HTMLElement) {
      slotElement.title = content;
    }
  }
}

onMounted(() => updateTooltip(props.content));
watch(
  () => props.content,
  (val) => updateTooltip(val)
);
</script>

<style scoped lang="scss"></style>
