interface WindowApi {
    closeWindow: () => void
    minimizeWindow: () => void
    maximizeWindow: () => void
    onWindowMaximized: any
    isWindowMaximized: () => void
}

declare interface Window {
  api: WindowApi;
}
