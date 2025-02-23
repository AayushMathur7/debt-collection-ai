import { z } from 'zod';

export type ConversationNotFoundResponse = {
  detail: {
    status: string;
    message: string;
  };
};

export type TranscriptTurn = {
  role: "user" | "agent";
  message: string | null;
  tool_calls: Array<{
    request_id: string;
    tool_name: string;
    params_as_json: string;
    tool_has_been_called: boolean;
  }> | null;
  tool_results: Array<{
    request_id: string;
    tool_name: string;
    result_value: string;
    is_error: boolean;
    tool_has_been_called: boolean;
  }> | null;
  time_in_call_secs: number;
};

export type ConversationSuccessResponse = {
  agent_id: string;
  conversation_id: string;
  status: "processing" | "done";
  transcript: TranscriptTurn[];
  metadata: {
    call_duration_secs: number;
    cost: number;
    termination_reason: string;
  };
  analysis: {
    call_successful: "success" | "failure" | "unknown";
    transcript_summary: string;
  };
  conversation_initiation_client_data: {
    conversation_config_override: {
      agent: any;
      tts: any;
    };
    custom_llm_extra_body: Record<string, any>;
    dynamic_variables: Record<string, any>;
  };
};

export type ConversationResponse = ConversationSuccessResponse | ConversationNotFoundResponse;

export const conversationResponseSchema = z.object({
  summary: z.string(),
  outcome: z.enum(["successful", "unsuccessful", "pending"]),
  date: z.string().transform((str) => new Date(str))
});

export type ConversationSummary = z.infer<typeof conversationResponseSchema>;
