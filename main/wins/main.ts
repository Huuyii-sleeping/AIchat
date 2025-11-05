import { MAIN_WIN_SIZE, WINDOW_NAMES } from "../../common/constants";
import windowManager from "../service/WindowService";

export function setupMainWindow() {
  windowManager.create(WINDOW_NAMES.MAIN, MAIN_WIN_SIZE);
}
