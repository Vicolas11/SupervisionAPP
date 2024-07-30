const ENV = (import.meta.env.VITE_NODE_ENV as string) || "development";

export const constants = {
  test: ENV === "test",
  dev: ENV === "development",
  prod: ENV === "production",
  baseURL: import.meta.env.VITE_BASE_URL as string,
};
