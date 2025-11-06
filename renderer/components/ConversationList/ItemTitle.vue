<template>
  <h2
    class="conversation-title w-full text-tx-secondary font-semibold loading-5 truncate"
    ref="titleRef"
  >
    <template v-if="isTitleOverflow">
      <native-tooltip :content="title">{{ title }}</native-tooltip>
    </template>
    <template v-else>
      {{ title }}
    </template>
  </h2>
</template>

<script setup lang="ts">
import { CTX_KEY } from "./constants";
import NativeTooltip from "../NativeTooltip.vue";

interface ItemTitleProps {
  title: string;
}
defineOptions({ name: "ItemTitle" });
const props = defineProps<ItemTitleProps>();
const isTitleOverflow = ref(false);
const titleRef = useTemplateRef<HTMLElement>("titleRef");
const ctx = inject(CTX_KEY, void 0);
/**
 * 判断是否超出
 * @param element
 */
function checkOverflow(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.scrollWidth > element.clientWidth;
}

function _updateOverflowStatus() {
  isTitleOverflow.value = checkOverflow(titleRef.value);
}

const updateOverflowStatus = useDebounceFn(_updateOverflowStatus, 100);

onMounted(() => {
  // 每次进行更新的时候都会监听，最开始也要更新一次
  updateOverflowStatus();
  window.addEventListener("resize", updateOverflowStatus);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateOverflowStatus);
});

// 外界width改变的时候，监听到，并更新是否超出
watch([() => props.title, () => ctx?.width.value], () =>
  updateOverflowStatus()
);
</script>

<style scoped></style>
