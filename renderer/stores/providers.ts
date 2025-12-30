import type { Provider } from "@common/types";
import { dataBase } from "../dataBase";
import { deepMerge, parseOpenAISetting } from "@common/utils";
import { CONFIG_KEYS } from "@common/constants";
import { encode } from "js-base64";
import useConfig from "@renderer/hooks/useConfig";

export const useProviderStore = defineStore("providers", () => {
  const providers = ref<Provider[]>([]);
  const config = useConfig();

  const allProviders = computed(() =>
    providers.value.map((item) => ({
      ...item,
      // 注意：这个存储的是字符串 但是使用的时候是对象类型
      openAISetting: parseOpenAISetting(item.openAISetting ?? ""),
    }))
  );

  async function initialize() {
    providers.value = await dataBase.providers.toArray();
  }

  async function updateProvider(id: number, provider: Partial<Provider>) {
    await dataBase.providers.update(id, { ...provider });
    providers.value = providers.value.map((item) =>
      item.id === id ? { ...(deepMerge(item, provider) as Provider) } : item
    );
    config[CONFIG_KEYS.PROVIDER] = encode(JSON.stringify(providers.value));
  }

  watch(
    () => config[CONFIG_KEYS.PROVIDER],
    () => initialize()
  );

  return {
    // state
    providers,
    // getters
    allProviders,
    // actions
    initialize,
    updateProvider,
  };
});
