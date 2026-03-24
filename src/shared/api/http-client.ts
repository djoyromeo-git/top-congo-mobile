import { ApiError } from '@/shared/api/api-error';
import i18n, { supportedLanguages, type AppLanguage } from '@/i18n';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  path: string;
  body?: Record<string, unknown> | null;
  headers?: Record<string, string>;
  accessToken?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

type HttpClientOptions = {
  baseUrl: string | null;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
};

function getAcceptLanguageHeader(): AppLanguage {
  const language = (i18n.resolvedLanguage || i18n.language || 'fr').toLowerCase();
  const primaryLanguage = language.split('-')[0];

  return supportedLanguages.includes(primaryLanguage as AppLanguage) ? (primaryLanguage as AppLanguage) : 'fr';
}

function buildUrl(baseUrl: string | null, path: string) {
  if (!baseUrl) {
    throw new ApiError({
      code: 'configuration',
      message: 'HTTP client base URL is not configured.',
    });
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  return `${normalizedBase}/${normalizedPath}`;
}

function extractErrorMessage(body: unknown, status: number) {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.trim().length > 0) {
      return record.message.trim();
    }
  }

  return `Request failed with HTTP ${status}.`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export function createHttpClient({
  baseUrl,
  defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  defaultTimeoutMs = 15000,
}: HttpClientOptions) {
  return {
    async requestWithMeta<TResponse>({ method = 'GET', path, body, headers, accessToken, timeoutMs, signal }: RequestOptions) {
      const url = buildUrl(baseUrl, path);

      const controller = new AbortController();
      const signals = [controller.signal, signal].filter(Boolean) as AbortSignal[];
      const activeSignal =
        signals.length === 1
          ? signals[0]
          : AbortSignal.any
            ? AbortSignal.any(signals)
            : controller.signal;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs ?? defaultTimeoutMs);

      let response: Response;

      try {
        response = await fetch(url, {
          method,
          headers: {
            ...defaultHeaders,
            'Accept-Language': getAcceptLanguageHeader(),
            ...headers,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: activeSignal,
        });
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError({
            code: 'timeout',
            message: 'The request timed out.',
          });
        }

        throw new ApiError({
          code: 'network',
          message: 'Network request failed.',
        });
      }

      clearTimeout(timeoutId);

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiError({
          code: 'http',
          status: response.status,
          body: responseBody,
          message: extractErrorMessage(responseBody, response.status),
        });
      }

      return {
        data: responseBody as TResponse,
        status: response.status,
        headers: response.headers,
      };
    },

    async request<TResponse>(options: RequestOptions) {
      const response = await this.requestWithMeta<TResponse>(options);
      return response.data;
    },

    get<TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'path' | 'body'>) {
      return this.request<TResponse>({
        ...options,
        method: 'GET',
        path,
      });
    },

    post<TResponse>(path: string, body?: Record<string, unknown> | null, options?: Omit<RequestOptions, 'method' | 'path' | 'body'>) {
      return this.request<TResponse>({
        ...options,
        method: 'POST',
        path,
        body,
      });
    },
  };
}
