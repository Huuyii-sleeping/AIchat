import OpenAI from "openai";
import { BaseProvider } from "./BaseProvider";
import logManager from "@main/service/LogService";

function _transformChunk(
  chunk: OpenAI.Chat.Completions.ChatCompletionChunk
): UniversalChunk {
  const choice = chunk.choices[0];
  return {
    isEnd: choice?.finish_reason === "stop",
    result: choice?.delta?.content ?? "",
  };
}

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;
  constructor(apiKey: string, baseURL: string) {
    super();
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async chat(
    messages: DialogueMessageProps[],
    modelName: string
  ): Promise<AsyncIterable<UniversalChunk>> {
    const startTime = Date.now();

    const lastMessage = messages[messages.length - 1];

    logManager.logApiRequest(
      "chat.completions.create",
      {
        modelName,
        lastMessage:
          lastMessage?.content?.substring(0, 100) +
          (lastMessage?.content?.length > 100 ? "..." : ""),
        messageCount: messages.length,
      },
      "POST"
    );
    try {
      const chunks = await this.client.chat.completions.create({
        model: modelName,
        messages,
        stream: true,
      });

      const responseTime = Date.now();
      logManager.logApiResponse(
        "chat.completions.create",
        { success: true },
        200,
        responseTime
      );
      return {
        async *[Symbol.asyncIterator]() {
          for await (const chunk of chunks) {
            yield _transformChunk(chunk);
          }
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logManager.logApiResponse(
        "chat.completions.create",
        {
          error: error instanceof Error ? error.message : String(error),
        },
        500,
        responseTime
      );
      throw error;
    }
  }
}
