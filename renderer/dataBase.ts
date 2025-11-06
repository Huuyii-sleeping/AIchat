import Dexie, { type EntityTable } from "dexie";
import type { Provider, Conversation, Message } from "@common/types";
import { logger } from "./utils/logger";
import { stringifyOpenAISetting } from "@common/utils";

export const providers: Provider[] = [
  {
    id: 1,
    name: "bigmodel",
    title: "智谱AI",
    models: ["glm-4.5-flash"],
    openAISetting: stringifyOpenAISetting({
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
      apiKey: "",
    }),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: 2,
    name: "deepseek",
    title: "深度求索 (DeepSeek)",
    models: ["deepseek-chat"],
    openAISetting: stringifyOpenAISetting({
      baseURL: "https://api.deepseek.com/v1",
      apiKey: "",
    }),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: 3,
    name: "siliconflow",
    title: "硅基流动",
    models: ["Qwen/Qwen3-8B", "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"],
    openAISetting: stringifyOpenAISetting({
      baseURL: "https://api.siliconflow.cn/v1",
      apiKey: "",
    }),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: 4,
    name: "qianfan",
    title: "百度千帆",
    models: ["ernie-speed-128k", "ernie-4.0-8k", "ernie-3.5-8k"],
    openAISetting: stringifyOpenAISetting({
      baseURL: "https://qianfan.baidubce.com/v2",
      apiKey: "",
    }),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
];

// 数据库的初始化操作 并定义了表当中的数据
// 简单的说就是在浏览器当中，创建了一个本地的数据库，存储这三类数据，并且规定了数据之间的存储格式和关联关系
export const dataBase = new Dexie("xqbot") as Dexie & {
  providers: EntityTable<Provider, "id">;
  conversations: EntityTable<Conversation, "id">;
  message: EntityTable<Message, "id">;
};

dataBase.version(1).stores({
  providers: "++id,name",
  conversations: "++id,providerId",
  messages: "++id,conversationId",
});

// 初始化provider表
export async function initProviders() {
  const count = await dataBase.providers.count();
  if (count === 0) {
    await dataBase.providers.bulkAdd(providers);
    logger.info("Providers data initialized successfully");
  }
}
