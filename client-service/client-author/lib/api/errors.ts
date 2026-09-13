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
  response: Response;
}): T {
  if (!response.response.ok || response.error !== undefined) {
    throw new ApiError(response.response.status, "Không thể tải dữ liệu.", response.error);
  }

  if (response.data === undefined) {
    throw new ApiError(response.response.status, "API không trả về dữ liệu.");
  }

  return response.data;
}
