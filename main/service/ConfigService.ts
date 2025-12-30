// 管理配置项的服务
import type { ConfigKeys, IConfig } from "@common/types";
import { app, BrowserWindow, ipcMain } from "electron";
import { CONFIG_KEYS, IPC_EVENTS } from "@common/constants";
import { debounce, simpleCloneDeep } from "@common/utils";
import * as fs from "fs";
import * as path from "path";
import logManager from "./LogService";

const DEFAULT_CONFIG: IConfig = {
  [CONFIG_KEYS.THEME_MODE]: "dark",
  [CONFIG_KEYS.PRIMARY_COLOR]: "#BB5BE7",
  [CONFIG_KEYS.LANGUAGE]: "zh",
  [CONFIG_KEYS.FONT_SIZE]: 14,
  [CONFIG_KEYS.MINIMIZE_TO_TRAY]: true,
  [CONFIG_KEYS.PROVIDER]: "",
  [CONFIG_KEYS.DEFAULT_MODEL]: null,
};

export class ConfigService {
  private static _instance: ConfigService;
  private _config: IConfig;
  private _configPath: string;
  private _defaultConfig: IConfig = DEFAULT_CONFIG;
  private _listeners: Array<(config: IConfig) => void> = [];

  private constructor() {
    // 获取配置文件路径
    this._configPath = path.join(app.getPath("userData"), "config.json");
    // 加载配置
    this._config = this._loadConfig();
    this._config = DEFAULT_CONFIG;
    // 设置IPC通信
    this._setupIpcEvents();
    logManager.info("ConfigService initialized sucessfully");
  }

  private _setupIpcEvents() {
    const duration = 200;
    const handleUpdate = debounce((val) => this.update(val), duration);
    const handleSet = debounce((key, val) => this.set(key, val), duration);

    ipcMain.handle(IPC_EVENTS.GET_CONFIG, (_, key) => this.get(key));
    ipcMain.on(IPC_EVENTS.SET_CONFIG, (_, key, val) => handleSet(key, val));
    ipcMain.on(IPC_EVENTS.UPDATE_CONFIG, (_, updates) => handleUpdate(updates));
  }

  public static getInstance(): ConfigService {
    if (!this._instance) {
      this._instance = new ConfigService();
    }
    return this._instance;
  }

  private _loadConfig(): IConfig {
    try {
      if (fs.existsSync(this._configPath)) {
        const configContent = fs.readFileSync(this._configPath, "utf-8");
        const config = { ...this._defaultConfig, ...JSON.parse(configContent) };
        logManager.info("Config loaded successfully form:", this._configPath);
        return config;
      }
    } catch (error) {
      logManager.error("Failed to load config", error);
    }
    return { ...this._defaultConfig };
  }

  private _saveConfig(): void {
    try {
      // 确保目录的存在
      fs.mkdirSync(path.dirname(this._configPath), { recursive: true });
      fs.writeFileSync(
        this._configPath,
        JSON.stringify(this._config, null, 2),
        "utf-8"
      );

      // 触发监听事件
      this._notifyListeners();

      logManager.info("Config saved successfully from:", this._configPath);
    } catch (error) {
      logManager.error("Failed to save config", error);
    }
  }

  private _notifyListeners(): void {
    BrowserWindow.getAllWindows().forEach((win) =>
      win.webContents.send(IPC_EVENTS.CONFIG_UPDATED, this._config)
    );
    this._listeners.forEach((listener) => listener({ ...this._config }));
  }

  public getConfig(): IConfig {
    return simpleCloneDeep(this._config);
  }

  public get<T = any>(key: ConfigKeys): T {
    return this._config[key] as T;
  }

  public set(key: ConfigKeys, value: unknown, autoSave: boolean = true): void {
    if (!(key in this._config)) return;
    const oldValue = this._config[key];
    if (oldValue === value) return;
    this._config[key] = value as never;
    logManager.debug(`Config set: ${key} = ${value}`);
    autoSave && this._saveConfig();
  }

  public update(updates: Partial<IConfig>, autoSave: boolean = true): void {
    this._config = { ...this._config, ...updates };
    autoSave && this._saveConfig();
  }

  public resetToDefault(): void {
    this._config = { ...this._defaultConfig };
    logManager.info(`Config reset to default`);
    this._saveConfig();
  }

  public onConfigChange(listener: (config: IConfig) => void): () => void {
    this._listeners.push(listener);
    return () => this._listeners.filter((l) => l !== listener);
  }
}

export const configManager = ConfigService.getInstance();
export default configManager;
