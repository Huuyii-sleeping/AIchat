type ThemeMode = "dark" | "light" | "system";

interface CreateDialogProps {
  winId?: string;
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  isModal?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}
type DialogueMessageRole = "user" | "assistant";
interface DialogueMessageProps {
  role: DialogueMessageRole;
  content: string;
}

interface CreateDialogueProps {
  messages: DialogueMessageProps[];
  providerName: string;
  selectedModel: string;
  messageId: number;
  conversationId: number;
}

interface UniversalChunk {
  isEnd: boolean;
  result: string;
}

interface DialogueBackStream {
  messageId: number;
  data: UniversalChunk & { isError?: boolean };
}

type windowNames = "main" | "setting" | "dialog";

interface WindowApi {
  openWindow: (name: windowNames) => void;
  closeWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
  isWindowMaximized: () => Promise<boolean>;

  setThemeMode: (mode: ThemeMode) => Promise<boolean>;
  getThemeMode: () => Promise<ThemeMode>;
  isDarkTheme: () => Promise<boolean>;
  onSystemThemeChange: (callback: (isDark: boolean) => void) => void;

  // 展示菜单对应的API
  showContextMenu: (menuId: string, dynamicOptions?: string) => Promise<any>;
  contextMenuItemClick: (menuId: string, cb: (id: string) => void) => void;
  removeContextMenuListener: (menuId: string) => void;

  viewIsReady: () => void;

  // 创建别的窗口的函数
  createDialog: (params: CreateDialogProps) => Promise<string>;
  _dialogFeedback: (val: "cancel" | "confirm", winId: number) => void;
  _dialogGetParams: () => Promise<CreateDialogProps>;

  startADialogue: (params: CreateDialogueProps) => void;
  onDialogueBack: (
    cb: (data: DialogueBackStream) => void,
    messageId: number
  ) => void;

  // 日志记录相关api
  logger: {
    debug: (message: string, ...meta: any[]) => void;
    info: (message: string, ...meta: any[]) => void;
    warn: (message: string, ...meta: any[]) => void;
    error: (message: string, ...meta: any[]) => void;
  };

  // config设置相关
  getConfig: (key: string) => Promise<any>;
  setConfig: (key: string, value: any) => void;
  updateConfig: (value: any) => void;
  onConfigChange: (callback: (config: any) => void) => () => void;
  removeConfigChangeListener: (callback: (config: any) => void) => void;
}

declare interface Window {
  api: WindowApi;
}
