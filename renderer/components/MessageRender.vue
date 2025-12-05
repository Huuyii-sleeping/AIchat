<template>
  <template v-if="content?.trim().length">
    <VueMarkdown :id="renderId" :source="content"></VueMarkdown>
  </template>
  <span v-else class="_cursor">{{ t("main.message.rendering") }}</span>
</template>

<script setup lang="ts">
import VueMarkdown from "vue-markdown-render";
defineOptions({ name: "messageRender" });
const props = defineProps<{
  msgId: number;
  content: string;
  isStreaming: boolean;
}>();
const { t } = useI18n();
const renderId = computed(() => `msg-render-${props.msgId}`);

const findLastElement = (target: HTMLElement): Element | void => {
  const isList = (el: Element) => el.tagName === "OL" || el.tagName === "UL";
  if (!target) return;
  let lastElement: Element | void = target.lastElementChild ?? target;
  // todo PRE(代码块处理)
  if (lastElement && isList(lastElement)) {
    lastElement = findLastElement(lastElement as HTMLElement);
  }

  if (lastElement && lastElement.tagName === "LI") {
    const _uls = lastElement.getElementsByTagName("ul");
    const _ols = lastElement.getElementsByTagName("ol");
    if (_uls.length) lastElement = findLastElement(_uls[0]);
    if (_ols.length) lastElement = findLastElement(_ols[0]);
  }

  return lastElement;
};

function addCursor(target: HTMLElement) {
  const lastElement = findLastElement(target);
  if (!lastElement) return;
  lastElement.classList.add("_cursor");
}

function removeCursor() {
  const target = document.getElementById(renderId.value);
  if (!target) return;
  const lastElement = findLastElement(target);
  lastElement?.classList.remove("_cursor");
}

async function handleCursor() {
  if (!props.isStreaming) return;
  await nextTick();
  const target = document.getElementById(renderId.value);
  target && addCursor(target);
}

watch(
  () => props.content,
  () => handleCursor()
);

watch(
  () => props.isStreaming,
  async (newVal, oldVal) => {
    if (!newVal && oldVal) {
      await nextTick();
      removeCursor();
    }
  }
);
</script>

<style>
._cursor::after {
  content: "";
  display: inline-block;
  width: 2px; 
  height: 1.2em;
  background-color: currentColor;
  animation: cursor-blink 1s infinite;
  transform: none;
  margin-left: 1px;
  vertical-align: middle; 
  line-height: inherit; 
  position: relative;
  z-index: 1;
}

div._cursor::after,
p._cursor::after,
li._cursor::after {
  height: 1em; 
  margin-left: 2px;
}

/* 针对代码块的兼容 */
pre._cursor::after {
  height: 1.4em;
  background-color: #fff; 
}

@keyframes cursor-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
