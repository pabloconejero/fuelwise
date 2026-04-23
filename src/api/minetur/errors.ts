export class MineturApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'MineturApiError';
    this.status = status;
    this.body = body;
  }
}

export class MineturTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Minetur request timed out after ${timeoutMs}ms`);
    this.name = 'MineturTimeoutError';
  }
}

export class MineturNetworkError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'MineturNetworkError';
    this.cause = cause;
  }
}
