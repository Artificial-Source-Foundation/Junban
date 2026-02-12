/** Generate a unique ID for tasks, projects, and tags. */
export function generateId(): string {
  // Simple nanoid-like ID generator (21 chars, URL-safe)
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
  const bytes = new Uint8Array(21);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < 21; i++) {
    id += alphabet[bytes[i] & 63];
  }
  return id;
}
