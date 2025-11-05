const iconMap = new Map([
  ["system", "mdi:auto-awesome-outline"],
  ["light", "entypo:light-up"],
  ["dark", "circum:dark"],
]);

const tooltipMap = new Map([
  ["system", "settings.theme.system"],
  ["light", "settings.theme.light"],
  ["dark", "settings.theme.dark"],
]);

export function useThemeMode() {
  const themeMode = ref<ThemeMode>("dark");
  const isDark = ref<boolean>(false);
  const { t } = useI18n()
  //   类似发布订阅模式
  const themeChangeCallback: Array<(mode: ThemeMode) => void> = [];
  const themeIcon = computed(() => iconMap.get(themeMode.value || "system"));
  const themeTooltip = computed(() =>
    t(tooltipMap.get(themeMode.value || 'system') as string)
  );

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode;
    window.api.setThemeMode(mode);
  }

  function getThemeMode() {
    return themeMode.value;
  }

  function onThemeChange(callback: (mode: ThemeMode) => void) {
    themeChangeCallback.push(callback);
  }

  onMounted(async () => {
    // 触发订阅列表
    window.api.onSystemThemeChange((_isDark) =>
      window.api.getThemeMode().then((res) => {
        isDark.value = _isDark;
        if (res !== themeMode.value) themeMode.value = res;
        themeChangeCallback.forEach((cb) => cb(res));
      })
    );
    isDark.value = await window.api.isDarkTheme();
    themeMode.value = await window.api.getThemeMode();
  });

  return {
    themeMode,
    isDark,
    themeIcon,
    themeTooltip,
    setThemeMode,
    getThemeMode,
    onThemeChange,
  };
}

export default useThemeMode;
