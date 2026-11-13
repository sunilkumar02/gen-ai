import { ApiError, apiRequest } from "@/lib/api/client";
import type { AuthUser, LoginRequest } from "@/types/auth";

function encodePassword(password: string): string {
  // Encode UTF-8 bytes so passwords containing Unicode are preserved.
  return btoa(Array.from(new TextEncoder().encode(password), (byte) => String.fromCharCode(byte)).join(""));
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return ["id", "email", "name", "created_at", "updated_at"].every(
    (field) => typeof user[field] === "string" && (user[field] as string).trim().length > 0,
  ) && Number.isFinite(Date.parse(user.created_at as string))
    && Number.isFinite(Date.parse(user.updated_at as string));
}

export async function loginUser(username: string, password: string): Promise<AuthUser> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password.trim()) {
    throw new ApiError("Enter your username and password to continue.", 0);
  }

  const payload: LoginRequest = { username: normalizedUsername, password: encodePassword(password) };
  let response: unknown;
  try {
    response = await apiRequest<unknown>("/auth/login", { method: "POST", body: payload, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        throw new ApiError("Sign-in failed. Check your username and password.", error.status);
      }
      if (error.status === 0) {
        throw new ApiError("Couldn't reach the login service. Check that the backend is running and allows requests from this app.", 0);
      }
      throw new ApiError("Couldn't sign in. Please try again.", error.status);
    }
    throw error;
  }

  if (!isAuthUser(response)) {
    throw new ApiError("The login service returned invalid user details. Please try again.", 200);
  }

  // Copy only documented user fields; never retain unexpected credentials/tokens.
  return {
    id: response.id,
    email: response.email,
    name: response.name,
    created_at: response.created_at,
    updated_at: response.updated_at,
  };
}
