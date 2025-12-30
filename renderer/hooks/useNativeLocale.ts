import { dateZhCN, enUS, zhCN } from "naive-ui";
import i18n from "@renderer/i18n";
import dateEnUs from "naive-ui/es/locales/date/enUS";

export function useNativeLocale() {
  const locale = computed(() => (i18n.global.locale === "zh" ? zhCN : enUS));
  const dateLocale = computed(() =>
    i18n.global.locale === "zh" ? dateZhCN : dateEnUs
  );

  return {
    locale,
    dateLocale,
  };
}

export default useNativeLocale;
