// 创建一个electron的窗口管理类
// 负责创建，管理和控制应用程序的窗口，对直接创建窗口进行封装

import type { WindowNames } from "../../common/types";
import { IPC_EVENTS, WINDOW_NAMES } from "../../common/constants";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  IpcMainInvokeEvent,
  WebContentsView,
  type IpcMainEvent,
} from "electron";
import { debounce } from "../../common/utils";
import logManager from "./LogService";

import path from "node:path";
import themeManager from "./ThemeService";

interface WindowState {
  instance: BrowserWindow | void;
  isHidden: boolean;
  onCreate: ((window: BrowserWindow) => void)[];
  onClose: ((window: BrowserWindow) => void)[];
}

interface SizeOptions {
  width: number; // 窗口宽度
  height: number; // 窗口高度
  maxWidth?: number; // 窗口最大宽度，可选
  maxHeight?: number; // 窗口最大高度，可选
  minWidth?: number; // 窗口最小宽度，可选
  minHeight?: number; // 窗口最小高度，可选
}

const SHARED_WINDOW_OPTIONS = {
  titleBarStyle: "hidden",
  title: "xq",
  show: false,
  opacity: 0,
  darkTheme: themeManager.isDark,
  backgroundColor: themeManager.isDark ? "#2C2C2C" : "#FFFFFF",
  webPreferences: {
    nodeIntegration: false, // 禁用 Node.js 集成，提高安全性
    contextIsolation: true, // 启用上下文隔离，防止渲染进程访问主进程 API
    sandbox: true, // 启用沙箱模式，进一步增强安全性
    backgroundThrottling: false,
    preload: path.join(__dirname, "preload.js"),
  },
} as BrowserWindowConstructorOptions;

class WindowService {
  private static _instance: WindowService;
  private _winStates: Record<WindowNames | string, WindowState> = {
    main: {
      instance: void 0,
      isHidden: false,
      onClose: [],
      onCreate: [],
    },
    setting: {
      instance: void 0,
      isHidden: false,
      onClose: [],
      onCreate: [],
    },
    dialog: {
      instance: void 0,
      isHidden: false,
      onClose: [],
      onCreate: [],
    },
  };

  private constructor() {
    this._setupIpcEvents();
    logManager.info("WindowService intialized Successfully");
  }

  private _isReallyClose(windowName: WindowNames | void) {
    //  todo 做最小化托盘 实现假关闭
    if (windowName === WINDOW_NAMES.MAIN) return true;
    if (windowName === WINDOW_NAMES.SETTING) return false; // 假关闭
    return true;
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      const target = BrowserWindow.fromWebContents(e.sender);
      const winName = this.getName(target);
      this.close(target, this._isReallyClose(winName));
    };
    const handleMinimizeWindow = (e: IpcMainEvent) => {
      BrowserWindow.fromWebContents(e.sender)?.minimize();
    };
    const handleMaximizeWindow = (e: IpcMainEvent) => {
      this.toggleMax(BrowserWindow.fromWebContents(e.sender));
    };
    const handleIsWindowMaximized = (e: IpcMainInvokeEvent) => {
      return BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false;
    };

    // 事件订阅，建立通道发送消息
    ipcMain.on(IPC_EVENTS.CLOSE_WINDOW, handleCloseWindow);
    ipcMain.on(IPC_EVENTS.MINIMIZE_WINDOW, handleMinimizeWindow);
    ipcMain.on(IPC_EVENTS.MAXIMIZE_WINDOW, handleMaximizeWindow);
    ipcMain.handle(IPC_EVENTS.IS_WINDOW_MAXIMIZED, handleIsWindowMaximized);
  }

  /**
   * 单例模式。避免窗口混乱
   * @returns
   */
  public static getInstance(): WindowService {
    if (!this._instance) {
      this._instance = new WindowService();
    }
    return this._instance;
  }

  /**
   * 窗口的创建 并配置相关内容 对窗口进行统一的配置
   * @param name
   * @param size
   * @returns
   */
  public create(
    name: WindowNames,
    size: SizeOptions,
    moreOpts?: BrowserWindowConstructorOptions
  ) {
    if (this.get(name)) return;
    // 判断窗口是否是隐藏状态（假关闭之后重新进行显示）
    const isHiddenWindow = this._isHiddenWin(name);
    let window = this._createWinInstance(name, moreOpts);

    // 不是隐藏的，执行新建逻辑
    !isHiddenWindow &&
      this._setupWinLifecycle(window, name)._loadWindowTemplate(window, name);

    // 监听视口就绪 显示 尺寸 加载动画等
    this._listenWinReady({
      win: window,
      isHiddenWin: isHiddenWindow,
      size: size,
    });

    // 新的窗口触发相应的操作
    if (!isHiddenWindow) {
      this._winStates[name].instance = window;
      this._winStates[name].onCreate.forEach((cb) => cb(window));
    }

    // 旧的窗口标记成显示状态
    if (isHiddenWindow) {
      this._winStates[name].isHidden = false;
      logManager.info(`Hidden Window show: ${name}`);
    }

    return window;
  }

  /**
   * 窗口的声明周期管理
   * 监听窗口的resize事件，通过防抖函数像渲染进行发送消息（避免频繁的触发）
   * 监听close事件，窗口关闭释放资源
   * @param window
   * @param _name
   * @returns
   */
  private _setupWinLifecycle(window: BrowserWindow, name: WindowNames) {
    const updateWinStatus = debounce(
      () =>
        !window?.isDestroyed() &&
        window?.webContents?.send(
          IPC_EVENTS.MAXIMIZE_WINDOW + "back",
          window?.isMaximized()
        ),
      80
    );
    window.once("closed", () => {
      this._winStates[name].onClose.forEach((cb) => cb(window));
      window?.destroy();
      window?.removeListener("resize", updateWinStatus);
      this._winStates[name].instance = void 0;
      this._winStates[name].isHidden = false;
      logManager.info(`Window closed: ${name}`);
    });
    window.on("resize", updateWinStatus);
    return this;
  }

  private _listenWinReady(params: {
    win: BrowserWindow;
    isHiddenWin: boolean;
    size: SizeOptions;
  }) {
    const { win, isHiddenWin, size } = params;
    const onReady = () => {
      win?.once("show", () =>
        setTimeout(() => this._applySizeConstraints(win, size), 2)
      );
      win?.show();
    };

    if (!isHiddenWin) {
      const loadingHandler = this._addLoadingView(win, size);
      loadingHandler?.(onReady);
    } else {
      onReady();
    }
  }
  /**
   * 创建独立的加载视图，渲染进程就绪了移除 就是先使用loading页面进行覆盖
   * @param window
   * @param size
   * @returns
   */
  private _addLoadingView(window: BrowserWindow, size: SizeOptions) {
    let loadingView: WebContentsView | void = new WebContentsView();
    let renderIsReady = false;
    window.contentView?.addChildView(loadingView);
    loadingView?.setBounds({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    });
    loadingView.webContents.loadFile(path.join(__dirname, "loading.html"));
    const onRenderIsReady = (e: IpcMainEvent) => {
      if (e.sender !== window.webContents || renderIsReady) return;
      renderIsReady = true;
      window.contentView.removeChildView(loadingView as WebContentsView);
      ipcMain.removeListener(IPC_EVENTS.RENDERER_IS_READY, onRenderIsReady);
      loadingView = void 0;
    };

    ipcMain.on(IPC_EVENTS.RENDERER_IS_READY, onRenderIsReady);
    return (cb: () => void) =>
      loadingView?.webContents.once("dom-ready", () => {
        loadingView?.webContents.insertCSS(`body {
          background-color: ${themeManager.isDark ? "#2C2C2C" : "#FFFFFF"} !important;
          --stop-color-start: ${themeManager.isDark ? "#A0A0A0" : "#7F7F7F"} !important;
          --stop-color-end: ${themeManager.isDark ? "#A0A0A0" : "#7F7F7F"} !important
        }`);
        cb();
      });
  }

  private _applySizeConstraints(win: BrowserWindow, size: SizeOptions) {
    if (size.maxHeight && size.maxWidth) {
      win.setMaximumSize(size.maxWidth, size.maxHeight);
    }
    if (size.minHeight && size.minWidth) {
      win.setMinimumSize(size.minWidth, size.minHeight);
    }
  }

  /**
   * 窗口内容的加载
   * @param window
   * @param name
   * @returns
   */
  private _loadWindowTemplate(window: BrowserWindow, name: WindowNames) {
    // 检查是否存在开发服务器 URL，若存在则表示处于开发环境
    // @ts-ignore
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return window.loadURL(
        // @ts-ignore
        `${MAIN_WINDOW_VITE_DEV_SERVER_URL}${"/html/" + (name === "main" ? "" : name)}`
      );
    }
    window.loadFile(
      path.join(
        __dirname,
        // @ts-ignore
        `../renderer/${MAIN_WINDOW_VITE_NAME}/html/${name === "main" ? "index" : name}.html`
      )
    );
  }

  private _handleCloseWindowState(target: BrowserWindow, really: boolean) {
    const name = this.getName(target) as WindowNames;
    if (name) {
      if (!really) this._winStates[name].isHidden = true;
      else this._winStates[name].instance = void 0;
    }
    setTimeout(() => {
      target[really ? "close" : "hide"]?.();
      this._checkAndCloseAllWindows();
    }, 200);
  }

  private _checkAndCloseAllWindows() {
    if (
      !this._winStates[WINDOW_NAMES.MAIN].instance ||
      this._winStates[WINDOW_NAMES.MAIN].instance.isDestroyed()
    ) {
      return Object.values(this._winStates).forEach((win) =>
        win?.instance?.close()
      );
    }
    const minimizeToTray = false; // todo 最小化托盘
    if (!minimizeToTray && !this.get(WINDOW_NAMES.MAIN)?.isVisible()) {
      return Object.values(this._winStates).forEach(
        (win) => !win?.instance?.isVisible() && win?.instance?.close()
      );
    }
  }

  private _isHiddenWin(name: WindowNames) {
    return this._winStates[name] && this._winStates[name].isHidden;
  }

  /**
   * 隐藏直接使用旧的实例，否则新建实例对象
   * @param name
   * @param opts
   * @returns
   */
  private _createWinInstance(
    name: WindowNames,
    opts?: BrowserWindowConstructorOptions
  ) {
    return this._isHiddenWin(name)
      ? (this._winStates[name].instance as BrowserWindow)
      : new BrowserWindow({
          ...SHARED_WINDOW_OPTIONS,
          ...opts,
        });
  }

  /**
   * 下面两个就是直接操作窗口的方法
   * @param target
   * @returns
   */
  public close(target: BrowserWindow | void | null, really = true) {
    if (!target) return;
    const name = this.getName(target);
    logManager.info(`Close window: ${name}, really: ${really}`);
    this._handleCloseWindowState(target, really);
  }

  public getName(target: BrowserWindow | null | void): WindowNames | void {
    if (!target) return;
    for (const [name, win] of Object.entries(this._winStates) as [
      WindowNames,
      { instance: BrowserWindow | void } | void,
    ][]) {
      if (win?.instance === target) return name;
    }
  }

  public get(name: WindowNames) {
    if (this._winStates[name].isHidden) return void 0;
    return this._winStates[name].instance;
  }

  public toggleMax(target: BrowserWindow | void | null) {
    if (!target) return;
    const action = target.isMaximized() ? "unmaximized" : "maximized";
    logManager.info(`Window ${action}`);
    target.isMaximized() ? target.unmaximize() : target.maximize();
  }

  public onWindowCreate(
    name: WindowNames,
    callback: (window: BrowserWindow) => void
  ) {
    this._winStates[name].onCreate.push(callback);
  }

  public onWindowClosed(
    name: WindowNames,
    callback: (window: BrowserWindow) => void
  ) {
    this._winStates[name].onClose.push(callback);
  }
}

export const windowManager = WindowService.getInstance();

export default windowManager;
