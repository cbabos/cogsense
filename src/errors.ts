import { AskEndPointParams } from "./types.js";

export class DefaultError extends Error {
  readonly code: string;
  readonly name: string;
  readonly message: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.name = this.constructor.name;
  }
}

export class InputError extends DefaultError {
  readonly input: AskEndPointParams;

  constructor(message: string, input: AskEndPointParams) {
    super("invalid_input", message);
    this.input = input;
  }
}

export class LLMTimeoutError extends DefaultError {
  constructor(timeoutInMs: number) {
    const message = `LLM Request approached configured timeout (${timeoutInMs} ms)`;
    super("llm_timeout", message);
  }
}

export class ProviderError extends DefaultError {
  readonly requestModel: string;

  constructor(message: string, requestModel: string) {
    super("provider_error", message);

    this.requestModel = requestModel;
  }
}

export class NetworkError extends DefaultError {
  readonly requestUrl: string;
  readonly body: unknown;

  constructor(message: string, requestUrl: string, body?: unknown) {
    super("network_error", message);

    this.requestUrl = requestUrl;
    this.body = body;
  }
}
