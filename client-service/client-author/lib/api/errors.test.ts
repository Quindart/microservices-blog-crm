import { describe, expect, it } from "vitest";
import { ApiError, unwrapResponse } from "./errors";

describe("unwrapResponse", () => {
  it("returns successful response data", () => {
    const data = unwrapResponse({
      data: { items: ["product"] },
      response: new Response(null, { status: 200 }),
    });

    expect(data).toEqual({ items: ["product"] });
  });

  it("turns an HTTP failure into an ApiError with status", () => {
    try {
      unwrapResponse({
        error: { message: "missing" },
        response: new Response(null, { status: 404 }),
      });
      expect.unreachable("Expected unwrapResponse to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
    }
  });

  it("rejects a successful response without data", () => {
    expect(() =>
      unwrapResponse({ response: new Response(null, { status: 204 }) }),
    ).toThrow("API không trả về dữ liệu.");
  });
});
