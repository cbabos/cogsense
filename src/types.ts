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
