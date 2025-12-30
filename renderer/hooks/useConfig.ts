import { IConfig } from "@common/types";
import { CONFIG_KEYS } from "@common/constants";
import { Reactive } from "vue";
import { getLanguage, setLanguage } from "@renderer/i18n";

const config: Reactive<IConfig> = reactive({
  [CONFIG_KEYS.THEME_MODE]: "dark",
  [CONFIG_KEYS.PRIMARY_COLOR]: "#BB5BE7",
  [CONFIG_KEYS.LANGUAGE]: "zh",
  [CONFIG_KEYS.FONT_SIZE]: 14,
  [CONFIG_KEYS.MINIMIZE_TO_TRAY]: true,
  [CONFIG_KEYS.PROVIDER]: "",
  [CONFIG_KEYS.DEFAULT_MODEL]: null,
});

const configKeys = [
  CONFIG_KEYS.THEME_MODE,
  CONFIG_KEYS.PRIMARY_COLOR,
  CONFIG_KEYS.LANGUAGE,
  CONFIG_KEYS.FONT_SIZE,
  CONFIG_KEYS.MINIMIZE_TO_TRAY,
  CONFIG_KEYS.PROVIDER,
  CONFIG_KEYS.DEFAULT_MODEL,
];

const setReactiveConf = (key: CONFIG_KEYS, value: IConfig[typeof key]) =>
  (config[key] = value as never);

configKeys.forEach((key) =>
  window.api.getConfig(key).then((val) => setReactiveConf(key, val))
);

// 双向监听的作用
export function useConfig() {
  // 监听主进程中数据的变化
  const removeListener = window.api.onConfigChange((_config: IConfig) => {
    configKeys.forEach((key) => {
      if (key === CONFIG_KEYS.LANGUAGE) {
        const lang = getLanguage();
        (lang !== config[key]) && setLanguage(config[key]);
      }
      if (_config[key] === config[key]) return;
      setReactiveConf(key, _config[key]);
    });
  });

  // 监听渲染层数据的变化
  const onReactiveChange = () => {
    configKeys.forEach(async (key) => {
      if (config[key] === (await window.api.getConfig(key))) return;
      window.api.setConfig(key, config[key]);
    });
  };

  watch(
    () => config,
    () => onReactiveChange(),
    { deep: true }
  );
  onUnmounted(() => removeListener?.());
  return config;
}

export default useConfig;
