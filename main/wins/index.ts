import { setupMainWindow } from "./main";
import { setupDialogWindow } from "./dialog";
import setupSettingWindow from "./setting";
export function setupWindows() {
  setupMainWindow();
  setupSettingWindow();
  setupDialogWindow();
}
