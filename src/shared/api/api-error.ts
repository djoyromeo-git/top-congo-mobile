type ApiErrorCode = 'configuration' | 'network' | 'timeout' | 'http';

type ApiErrorOptions = {
  code: ApiErrorCode;
  message: string;
  status?: number | null;
  body?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly body: unknown;

  constructor({ code, message, status = null, body = null }: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.body = body;
  }
}
