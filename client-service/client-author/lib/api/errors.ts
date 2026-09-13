export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unwrapResponse<T>(response: {
  data?: T;
  error?: unknown;
  response?: Response;
}): T {
  const status = response.response?.status ?? 0;

  if (response.error !== undefined || (response.response && !response.response.ok)) {
    throw new ApiError(status, "Không thể tải dữ liệu.", response.error);
  }

  if (response.data === undefined) {
    throw new ApiError(status, "API không trả về dữ liệu.");
  }

  return response.data;
}
