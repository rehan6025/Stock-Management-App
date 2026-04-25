export const AUTH_COOKIE_NAME = "campa_auth";

export function isAuthedCookieValue(value: string | undefined) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return value === expected;
}

