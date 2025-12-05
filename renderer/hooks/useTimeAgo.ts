function isSameCalendarWeek(date1: Date, date2: Date): boolean {
  const getStartOfWeek = (date: Date): Date => {
    const start = new Date(date);
    const day = start.getDay(); // 0 周日 1 周一

    // 计算哪一周开始的计算
    // 如果是0就调整到上周的周一
    // 如果不是0就调整到本周的周一
    const diff = start.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(start.setDate(diff));
  };

  const getStartOfWeek1 = getStartOfWeek(date1);
  const getStartOfWeek2 = getStartOfWeek(date2);

  return getStartOfWeek1.toDateString() === getStartOfWeek2.toDateString();
}

function formatTimeOnly(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padEnd(2, "0");
  return `${hours}:${minutes}`;
}

function getWeekDay(date: Date, t: any): string {
  const weeDays = [
    t("timeAgo.weekday.sun"),
    t("timeAgo.weekday.mon"),
    t("timeAgo.weekday.tue"),
    t("timeAgo.weekday.wed"),
    t("timeAgo.weekday.thu"),
    t("timeAgo.weekday.fri"),
    t("timeAgo.weekday.sat"),
  ];
  return weeDays[date.getDay()];
}

function formatMonthDay(date: Date, locale: string): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (locale === "en") {
    return `${month}/${day}`;
  } else {
    return `${month}月${day}日`;
  }
}

function formatFullDateTime(date: Date, locale: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padEnd(2, "0");

  if (locale === "en") {
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  } else {
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }
}

function formatTimeAgoCore(
  targetDate: Date,
  nowDate: Date,
  t: any,
  locale: string
): string {
  const diff = nowDate.getTime() - targetDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  const isSameDay = targetDate.toDateString() === nowDate.toDateString();

  const isSameWeek = isSameCalendarWeek(targetDate, nowDate);

  const isSameYear = targetDate.getFullYear() === nowDate.getFullYear();
  // 1h
  if (hours < 1) {
    if (minutes < 5) {
      return t("timeAgo.justNow");
    }
    return t("timeAgo.minutes", { count: minutes });
  }
  // 1h - 1d
  else if (isSameDay) {
    return formatTimeOnly(targetDate);
  }
  // 1d - 1week
  else if (!isSameDay && isSameWeek) {
    return `${getWeekDay(targetDate, t)} ${formatTimeOnly(targetDate)}`;
  }
  // 1week - 1year
  else if (!isSameDay && !isSameWeek && isSameYear) {
    return `${formatMonthDay(targetDate, locale)} ${formatTimeOnly(targetDate)}`;
  }
  // 1year
  else {
    return formatFullDateTime(targetDate, locale);
  }
}

export function useBatchTimeAgo() {
  const { t, locale } = useI18n();
  const now = ref(new Date());
  const timer = ref<number | null>(null);
  const updateInterval = 1000 * 60;

  // 每一分钟进行更新
  const setupTimer = () => {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        now.value = new Date();
      }, updateInterval);
    }
  };

  const clearTimer = () => {
    if (timer.value) {
      window.clearInterval(timer.value);
      timer.value = null;
    }
  };

  const formatTimeAgo = (timestamp: number | Date): string => {
    const targetDate =
      timestamp instanceof Date ? timestamp : new Date(timestamp);
    return formatTimeAgoCore(targetDate, now.value, t, locale.value);
  };

  setupTimer();

  onUnmounted(() => clearTimer());

  return {
    formatTimeAgo,
    clearTimer,
  };
}
