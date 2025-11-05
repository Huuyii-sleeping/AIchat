// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { IPC_EVENTS } from "./common/constants";

const api: WindowApi = {
  closeWindow: () => ipcRenderer.send(IPC_EVENTS.CLOSE_WINDOW),
  minimizeWindow: () => ipcRenderer.send(IPC_EVENTS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.send(IPC_EVENTS.MAXIMIZE_WINDOW),
  onWindowMaximized: (callback: (isMaxmized: boolean) => void) =>
    ipcRenderer.on(IPC_EVENTS.MAXIMIZE_WINDOW + "back", (_, isMaxmized) =>
      callback(isMaxmized)
    ),
  isWindowMaximized: () => ipcRenderer.invoke(IPC_EVENTS.IS_WINDOW_MAXIMIZED),

  // 转发日志操作
  logger: {
    debug: (message: string, ...meta: any[]) =>
      ipcRenderer.send(IPC_EVENTS.LOG_DEBUG, message, ...meta),
    info: (message: string, ...meta: any[]) =>
      ipcRenderer.send(IPC_EVENTS.LOG_INFO, message, ...meta),
    error: (message: string, ...meta: any[]) =>
      ipcRenderer.send(IPC_EVENTS.LOG_ERROR, message, ...meta),
    warn: (message: string, ...meta: any[]) =>
      ipcRenderer.send(IPC_EVENTS.LOG_WARN, message, ...meta),
  },
};

// 挂载到window的对象上面
contextBridge.exposeInMainWorld("api", api);
