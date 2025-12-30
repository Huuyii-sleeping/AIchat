import { app, BrowserWindow, globalShortcut } from "electron";
import logManager from "./LogService";

export class ShortcutService {
  private static _instance: ShortcutService;
  private _registerShortcuts: Map<string, Electron.Accelerator> = new Map();

  private _registerDefaultShortcuts() {
    app.whenReady().then(() => {});
  }

  private _setupAppEvents() {
    app.on("will-quit", () => {
      // 注销全部的快捷键
      this.unregisterAll();
    });

    app.on("browser-window-blur", () => {
      // 失去焦点时候的注销快捷键
    });

    app.on("browser-window-focus", () => {
      // 聚焦时候的快捷键
    });
  }

  private constructor() {
    this._registerDefaultShortcuts();
    this._setupAppEvents();
    logManager.info(`Shortcut service initialize`);
  }

  public static getInstance(): ShortcutService {
    if (!this._instance) this._instance = new ShortcutService();
    return this._instance;
  }

  public register(
    accelerator: Electron.Accelerator,
    id: string,
    callback: () => void
  ): boolean {
    try {
      // 注销已经存在的
      if (this._registerShortcuts.has(id)) {
        this.unregister(id);
      }

      const res = globalShortcut.register(accelerator, callback);
      if (res) {
        this._registerShortcuts.set(id, accelerator);
        logManager.info(
          `Shortcut ${id} registerd with accelerator ${accelerator}`
        );
      } else {
        logManager.error(
          `Failed to register shortcut ${id} with accelerator ${accelerator}`
        );
      }
      return res;
    } catch (error) {
      logManager.error(`Failed to register shortcut ${id}: ${error}`);
      return false;
    }
  }

  public unregister(id: string): boolean {
    try {
      const accelerator = this._registerShortcuts.get(id);
      if (accelerator) {
        globalShortcut.unregister(accelerator);
        this._registerShortcuts.delete(id);
        logManager.info(
          `Shortcut ${id} unregister with accelerator ${accelerator}`
        );
        return true;
      }
      return false;
    } catch (error) {
      logManager.error(`Failed to unregister shortcut ${id}: ${error}`);
      return false;
    }
  }

  public unregisterAll(): void {
    try {
      globalShortcut.unregisterAll();
      this._registerShortcuts.clear();
      logManager.info(`All shortcuts unregistered`);
    } catch (error) {
      logManager.error(`Failed to unregister all shortcuts: ${error}`);
    }
  }

  public isRegistered(accelerator: Electron.Accelerator): boolean {
    try {
      return globalShortcut.isRegistered(accelerator);
    } catch (error) {
      logManager.error(
        `Failed to check if shortcut ${accelerator} is registered: ${error}`
      );
      return false;
    }
  }

  public getRegisteredShortcuts(): Map<string, Electron.Accelerator> {
    return new Map(this._registerShortcuts);
  }

  public registerForWindow(
    window: BrowserWindow,
    callback: (input: Electron.Input) => boolean | void
  ) {
    window.webContents.on("before-input-event", (e, input) => {
      if (!window.isFocused()) return;
      if ((input.type === "keyDown" && callback(input)) === true)
        e.preventDefault();
    });
  }
}

export const shortcutManager = ShortcutService.getInstance();
export default shortcutManager;
