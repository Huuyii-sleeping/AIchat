import { CONFIG_KEYS } from "@common/constants";
import en from "@locales/en.json";
import zh from "@locales/zh.json";
import configManager from "@main/service/ConfigService";
import logManager from "@main/service/LogService";
import * as path from "path";

type MessageSchema = typeof zh;
const messages: Record<string, MessageSchema> = { en, zh };

export function createTranslator() {
  // 路径，用来找到对应的内容
  return (key?: string) => {
    if (!key) return void 0;
    try {
      const keys = key?.split(".");
      let result: any = messages[configManager.get(CONFIG_KEYS.LANGUAGE)];
      for (const _key of keys) {
        result = result[_key]; // 不断的向深层进行遍历
      }
      return result as string;
    } catch (error) {
      logManager.error("failed to translate key:", key, error);
      return key;
    }
  };
}

let logo: string | void;
export function createLogo() {
  if (logo != null) {
    return logo;
  }
  logo = path.join(__dirname, "logo.ico");
  return logo;
}
