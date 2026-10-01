export enum MsgRole {
  Assistant = "assistant",
  User = "user",
  System = "system",
}

export type InputMessage = {
  role: MsgRole;
  content: string;
};

export type AskEndPointParams = {
  model: string;
  messages: InputMessage[];
  timeoutMs?: number;
};

export enum FinishReason {
  Stop = "stop",
  Length = "length",
  ToolCalls = "tool_calls",
  ContentFilter = "content_filter",
  FunctionCall = "function_call",
}

export type FunctionToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type CustomToolCall = {
  id: string;
  type: "custom";
  custom: {
    name: string;
    input: string;
  };
};

export type UrlCitation = {
  end_index: number;
  start_index: number;
  url: string;
  title: string;
};

export type AudioResponseObject = {
  id: string;
  expires_at: number;
  data: string; // Base64 encoded audio bytes
  transcript: string;
};

export type OpenApiResponse = {
  id: string;
  model: string;
  choices: {
    index: number;
    role: MsgRole;
    message: InputMessage & {
      refusal: string | null;
      tool_calls: FunctionToolCall | CustomToolCall;
    };
    finish_reashon: FinishReason;
    annotations: UrlCitation[];
    audio: AudioResponseObject | null;
  };
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
};

export type MessageResponse = {
  id: string;
  model: string;
  messages: InputMessage;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};
