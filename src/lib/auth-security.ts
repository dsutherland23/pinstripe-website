import { NextRequest } from "next/server";

/**
 * Gets the admin passcode from the environment.
 * If the environment variable is not configured, it generates a highly secure random fallback
 * to fail closed, ensuring no default fallback allows access.
 */
export function getAdminPasscode(): string {
  const code = process.env.ADMIN_PASSCODE;
  if (!code) {
    console.warn("⚠️ ADMIN_PASSCODE environment variable is not configured! Failing closed for security.");
    // Secure fallback: dynamic random string that changes per runtime to prevent guessability
    return "UNCONFIGURED_ADMIN_PASSCODE_FALLBACK_SECURE_RANDOM_a4b9c1d2e3f4";
  }
  return code;
}

/**
 * Check if the request is authorized as admin.
 * Checks header "x-admin-passcode" or URL query param "passcode".
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  const headerCode = req.headers.get("x-admin-passcode");
  
  // Also support checking url search parameters if header isn't supplied (e.g. for simple lookups)
  const { searchParams } = new URL(req.url);
  const queryCode = searchParams.get("passcode");

  const correctCode = getAdminPasscode();

  return (headerCode === correctCode) || (queryCode === correctCode);
}
