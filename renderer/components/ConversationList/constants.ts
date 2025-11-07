import type { InjectionKey, ComputedRef, Ref } from "vue";

export const CTX_KEY: InjectionKey<{
  width: ComputedRef<number>;
  editId: ComputedRef<number | null | void>;
  checkIds: Ref<number[]>;
}> = Symbol("ConversationListContext");
