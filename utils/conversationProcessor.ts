import { compact } from 'lodash';
import { ConversationResponse, ConversationSummary, conversationResponseSchema } from '../types/conversation';
import { CoreMessage, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function processConversationData(data: ConversationResponse): Promise<ConversationSummary | null> {
  if (!("conversation_id" in data)) {
    return null;
  }

  const extractedMessages = compact(
    data.transcript.map((turn) => {
      let content = turn.message;

      if (turn.tool_results) {
        if (turn.tool_results[0].tool_name === "end_call") {
          content = "[HANGS UP]";
        }
      } else if (!content) return null;

      return { role: turn.role, content };
    }),
  );

  if (extractedMessages[extractedMessages.length - 1].content !== "[HANGS UP]") {
    extractedMessages.push({ role: "user", content: "[HANGS UP]" });
  }

  const formattedMessages = extractedMessages
    .map((turn) => `${turn.role === "user" ? "Debtor" : "Debt Collector"}: ${turn.content}`)
    .join("\n");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `You are a helpful assistant who accurately summarizes conversations.

You will be provided a transcript of a call between a debt collector and a debtor. Take special note about what was being discussed and what is the final resolution of the call.

Your summary should be a list of points describing the high level key events that happened during the call. Do not insert bullet points or other formatting.

It should be formatted like:
Debtor ...
Debt Collector ...

For the outcome, it should be successful if both parties agree to a settlement or payment plan. It should be unsuccessful if the debtor is not willing to pay or the debt collector is not able to get a response from the debtor. It should be pending if the debt collector is still trying to reach the debtor.`,
    },
    {
      role: "user",
      content: formattedMessages,
    },
  ];

  const openai = createOpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY })
  const model = openai("gpt-4o")

  const { object } = await generateObject({
    model,
    messages,
    schema: conversationResponseSchema,
  });

  return object;
}