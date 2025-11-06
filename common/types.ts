import { WINDOW_NAMES } from "./constants";

export type WindowNames = `${WINDOW_NAMES}`;

export interface Provider {
  id: number;
  name: string;
  visible?: boolean;
  title?: string;
  type?: "OpenAI";
  openAISetting?: string;
  createdAt: number;
  updatedAt: number;
  models: string[];
}

// 对话框的样式
export interface Conversation {
  id: number;
  title: string;
  selectedModel: string;
  createdAt: number;
  updatedAt: number;
  providerId: number;
  pinned: boolean;
  // 分割线功能
  type?: "divider" | "conversation";
}
// message展示的状态
export type MessageStatus = "loading" | "streaming" | "success" | "error";

export interface Message {
  id: number;
  content: string;
  type: "question" | "answer";
  createdAt: number;
  updatedAt?: number;
  status?: MessageStatus;
  conversationId: number;
}

export interface OpenAISetting {
  baseURL?: string;
  apiKey?: string;
}
