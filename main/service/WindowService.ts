// 创建一个electron的窗口管理类
// 负责创建，管理和控制应用程序的窗口，对直接创建窗口进行封装

import type { WindowNames } from "../../common/types";
import { IPC_EVENTS } from "../../common/constants";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  IpcMainInvokeEvent,
  type IpcMainEvent,
} from "electron";
import { debounce } from "../../common/utils";
import logManager from "./LogService";

import path from "node:path";
import themeManager from "./ThemeService";

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

  private constructor() {
    this._setupIpcEvents();
    logManager.info("WindowService intialized Successfully");
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      this.close(BrowserWindow.fromWebContents(e.sender));
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
  public create(name: WindowNames, size: SizeOptions) {
    logManager.info(`[Window] Creating window: ${name} with size:`, size);
    const window = new BrowserWindow({
      ...SHARED_WINDOW_OPTIONS,
      ...size,
    });

    this._setupWinLifecycle(window, name)._loadWindowTemplate(window, name);

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
  private _setupWinLifecycle(window: BrowserWindow, _name: WindowNames) {
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
      window?.destroy();
      window?.removeListener("resize", updateWinStatus);
      logManager.info(`Window closed`);
    });
    window.on("resize", updateWinStatus);

    return this;
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

  /**
   * 下面两个就是直接操作窗口的方法
   * @param target
   * @returns
   */
  public close(target: BrowserWindow | void | null) {
    if (!target) return;
    logManager.info(`Closing window`);
    target?.close();
  }

  public toggleMax(target: BrowserWindow | void | null) {
    if (!target) return;
    const action = target.isMaximized() ? "unmaximized" : "maximized";
    logManager.info(`Window ${action}`);
    target.isMaximized() ? target.unmaximize() : target.maximize();
  }
}

export const windowManager = WindowService.getInstance();

export default windowManager;
