import { apiConfig } from "@/lib/api/config";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const endpoint = `${apiConfig.baseUrl}/${path.replace(/^\/+/, "")}`;
  const hasBody = options.body !== undefined;
  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...options,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "The request could not be completed.",
      0,
    );
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(
      message || `The request failed with status ${response.status}.`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("The server returned an invalid response.", response.status);
  }
}
