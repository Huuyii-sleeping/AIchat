import { IPC_EVENTS } from "@common/constants";
import { promisify } from "util";
import { app, ipcMain } from "electron";
import log from "electron-log";
import * as path from "path";
import * as fs from "fs";

// 将Node中的异步回调函数转换成返回Promise的异步函数。方便直接使用await/async进行调用
const readdirAsync = promisify(fs.readdir);
const stateAsync = promisify(fs.stat);
const unlinkAsync = promisify(fs.unlink);

// 仍然单例模式，获取唯一实例对象
class LogService {
  private static _instance: LogService;
  // 最大存储天数7天
  private LOG_RETENTION_DAYS = 7;
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

  private constructor() {
    // 日志目录创建 用户数据目录下的logs文件夹
    const logPath = path.join(app.getPath("userData"), "logs");

    // 创建日志目录
    try {
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }
    } catch (error) {
      this.error("Failed to create log directory:", error);
    }

    log.transports.file.resolvePathFn = () => {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return path.join(logPath, `${formattedDate}.log`);
    };

    // 配置日志的格式
    log.transports.file.format = `[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}`;
    // 配置日志文件的限制大小
    log.transports.file.maxSize = 10 * 1024 * 1024;
    // 配置控制台日志级别，开发环境可以设置debug 生产环境可以设置成info
    log.transports.console.level =
      process.env.NODE_ENV === "development" ? "debug" : "info";
    // 配置文件日志级别
    log.transports.file.level = "debug";

    // 设置IPC事件
    this._setupIpcEvents();
    // 重写console方法 直接调用方法
    this._rewriteConsole();

    this.info("LogService intialized Successfully");

    // 清除日志记录
    this._cleanoldLogs();
    setInterval(() => this._cleanoldLogs(), this.CLEANUP_INTERVAL_MS);
  }

  private _setupIpcEvents() {
    ipcMain.on(IPC_EVENTS.LOG_DEBUG, (_e, message: string, ...meta: any[]) => {
      this.debug(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_INFO, (_e, message: string, ...meta: any[]) => {
      this.info(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_WARN, (_e, message: string, ...meta: any[]) => {
      this.warn(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_ERROR, (_e, message: string, ...meta: any[]) => {
      this.error(message, ...meta);
    });
  }

  private _rewriteConsole() {
    console.debug = log.debug;
    console.log = log.info;
    console.info = log.info;
    console.warn = log.warn;
    console.error = log.error;
  }

  private async _cleanoldLogs() {
    try {
      const logPath = path.join(app.getPath("userData"), "logs");
      if (!fs.existsSync(logPath)) {
        return;
      }
      const now = new Date();
      const expirationData = new Date(
        now.getTime() - this.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000
      );
      const files = await readdirAsync(logPath);
      let deleteCount = 0;
      for (const file of files) {
        if (!file.endsWith(".log")) continue;
        const filePath = path.join(logPath, file);
        try {
          const stats = await stateAsync(filePath);
          if (stats.isFile() && stats.birthtime < expirationData) {
            await unlinkAsync(filePath);
            deleteCount++;
          }
        } catch (error) {
          this.error(`Failed to delete old log file ${filePath}}:`, error);
        }
      }
      if (deleteCount > 0) {
        this.info(`Successfully cleanup ${deleteCount} old log files`);
      }
    } catch (error) {
      this.error("Failed to cleanup old logs:", error);
    }
  }

  public static getInstance(): LogService {
    if (!this._instance) {
      this._instance = new LogService();
    }
    return this._instance;
  }

  /**
   * 调式信息
   * @param message
   * @param meta
   */
  public debug(message: string, ...meta: any[]): void {
    log.debug(message, ...meta);
  }

  /**
   * 一般信息
   * @param message
   * @param meta
   */
  public info(message: string, ...meta: any[]): void {
    log.info(message, ...meta);
  }

  /**
   * 警告信息
   * @param message
   * @param meta
   */
  public warn(message: string, ...meta: any[]): void {
    log.warn(message, ...meta);
  }

  /**
   * 错误信息
   * @param message
   * @param meta
   */
  public error(message: string, ...meta: any[]): void {
    log.error(message, ...meta);
  }

  public logApiRequest(
    endpoint: string,
    data: any = {},
    method: string = "POST"
  ): void {
    this.info(
      `API Request: ${endpoint}, Method: ${method}, Request: ${JSON.stringify(data)}`
    );
  }

  public logApiResponse(
    endpoint: string,
    response: any = {},
    statusCode: number = 200,
    responseTime: number = 0
  ): void {
    if (statusCode >= 400) {
      this.error(
        `API Error Response: ${endpoint}, Status: ${statusCode}, Response Time: ${responseTime}ms, Response: ${JSON.stringify(response)}`
      );
    } else {
      this.debug(
        `API Response: ${endpoint}, Status: ${statusCode}, Response Time: ${responseTime}ms, Response: ${JSON.stringify(response)}`
      );
    }
  }

  public logUserOperation(
    operation: string,
    userId: string = "unknown",
    details: any = {}
  ): void {
    this.info(
      `User operation ${operation} by ${userId}, Details: ${JSON.stringify(details)}`
    );
  }
}

export const logManager = LogService.getInstance();
export default logManager;
