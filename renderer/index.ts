/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./styles/index.css";
import "vfonts/Lato.css";

import App from "../renderer/App.vue";
import i18n from "./i18n";
import { errorHandler } from "./utils/errorHandler";
import TitleBar from "./components/TitleBar.vue";
import DragRegion from "./components/DragRegion.vue";
import router from "./router";
import { createPinia } from "pinia";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("vue", xml);

const components = function (app: any) {
  app.component("TitleBar", TitleBar);
  app.component("DragRegion", DragRegion);
};

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(i18n)
  .use(components as any)
  .use(router)
  .use(errorHandler)
  .mount("#app");
