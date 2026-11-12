const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const apiConfig = {
  baseUrl: configuredApiUrl ? configuredApiUrl.replace(/\/+$/, "") : "/api",
};
