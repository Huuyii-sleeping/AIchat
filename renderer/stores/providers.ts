import type { Provider } from "@common/types";
import { dataBase } from "@renderer/dataBase";
export const useProviderStore = defineStore("provider", () => {
  const providers = ref<Provider[]>([]);

  const allProviders = computed(() => providers.value);

  async function initialize() {
    providers.value = await dataBase.providers.toArray();
  }

  return {
    providers,
    allProviders,
    initialize,
  }
});
