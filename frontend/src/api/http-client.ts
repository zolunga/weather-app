export interface ApiErrorBody {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function buildApiUrl(path: string, params?: Record<string, string | undefined>): string {
  const url = new URL(path, apiBaseUrl);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function getJson<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildApiUrl(path, params), {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new ApiError('Unable to reach the weather service. Please try again shortly.', 0);
  }

  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(getErrorMessage(body, response.status), response.status, body);
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(body: ApiErrorBody | undefined, status: number): string {
  if (Array.isArray(body?.message)) {
    return body.message.join(' ');
  }

  if (body?.message) {
    return body.message;
  }

  if (status === 404) {
    return 'Location not found. Check the spelling and try again.';
  }

  return 'Unable to load weather data. Please try again.';
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return undefined;
  }
}
