import "server-only";

export function isValidEmail(input: unknown): input is string {
  if (typeof input !== "string") return false;
  const email = input.trim();
  if (email.length < 3 || email.length > 254) return false;
  // Simple, pragmatic validation (not full RFC).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

