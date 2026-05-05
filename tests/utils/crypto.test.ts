import { afterEach, beforeEach, describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { encryptValue, decryptValue, isEncryptedValue } from "../../src/utils/crypto.js";

const SECRET_FILE_ENV = "JUNBAN_SECRET_KEY_FILE";
const ENCRYPTED_VALUE_PREFIX = "enc:v1:";
const SALT = "junban-aes256-v1";
const PBKDF2_ITERATIONS = 100_000;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function legacySeed(): string {
  if (typeof globalThis.crypto?.subtle !== "undefined" && typeof navigator !== "undefined") {
    return navigator.userAgent + "junban-encryption-key";
  }
  return "junban-fallback-device-seed";
}

function encryptLegacyValue(plaintext: string): string {
  const key = pbkdf2Sync(legacySeed(), SALT, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return ENCRYPTED_VALUE_PREFIX + Buffer.concat([iv, encrypted, authTag]).toString("base64");
}

describe("crypto", () => {
  let tempDir: string;
  let previousSecretFile: string | undefined;

  beforeEach(() => {
    previousSecretFile = process.env[SECRET_FILE_ENV];
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "junban-crypto-test-"));
    process.env[SECRET_FILE_ENV] = path.join(tempDir, "secret.key");
  });

  afterEach(() => {
    if (previousSecretFile === undefined) {
      delete process.env[SECRET_FILE_ENV];
    } else {
      process.env[SECRET_FILE_ENV] = previousSecretFile;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("isEncryptedValue", () => {
    it("returns true for values with the encryption prefix", () => {
      expect(isEncryptedValue("enc:v1:abc123")).toBe(true);
    });

    it("returns false for plain text", () => {
      expect(isEncryptedValue("sk-abc123")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isEncryptedValue("")).toBe(false);
    });

    it("returns false for partial prefix", () => {
      expect(isEncryptedValue("enc:v1")).toBe(false);
      expect(isEncryptedValue("enc:")).toBe(false);
    });
  });

  describe("encryptValue / decryptValue round-trip", () => {
    it("encrypts and decrypts a simple string", async () => {
      const plaintext = "sk-test-api-key-12345";
      const encrypted = await encryptValue(plaintext);

      expect(isEncryptedValue(encrypted)).toBe(true);
      expect(encrypted).not.toContain(plaintext);

      const decrypted = await decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts an empty string", async () => {
      const encrypted = await encryptValue("");
      expect(isEncryptedValue(encrypted)).toBe(true);

      const decrypted = await decryptValue(encrypted);
      expect(decrypted).toBe("");
    });

    it("encrypts and decrypts a long API key", async () => {
      const plaintext = "sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const encrypted = await encryptValue(plaintext);
      const decrypted = await decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts unicode content", async () => {
      const plaintext = "token-with-émojis-🔑-and-ünïcödë";
      const encrypted = await encryptValue(plaintext);
      const decrypted = await decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("produces different ciphertexts for the same plaintext (random IV)", async () => {
      const plaintext = "same-key-different-encryption";
      const enc1 = await encryptValue(plaintext);
      const enc2 = await encryptValue(plaintext);

      // Both should decrypt to the same value
      expect(await decryptValue(enc1)).toBe(plaintext);
      expect(await decryptValue(enc2)).toBe(plaintext);

      // But the encrypted values should differ (different IV each time)
      expect(enc1).not.toBe(enc2);
    });

    it("creates a node secret file with restrictive permissions", async () => {
      await encryptValue("secret-file-probe");

      const secretFile = process.env[SECRET_FILE_ENV]!;
      const stat = fs.statSync(secretFile);
      const secret = fs.readFileSync(secretFile, "utf8").trim();

      expect(secret.length).toBeGreaterThanOrEqual(32);
      expect(stat.mode & 0o777).toBe(0o600);
    });
  });

  describe("decryptValue fallback behavior", () => {
    it("returns plaintext unchanged when value is not encrypted", async () => {
      const plaintext = "sk-not-encrypted-key";
      const result = await decryptValue(plaintext);
      expect(result).toBe(plaintext);
    });

    it("returns empty string unchanged", async () => {
      const result = await decryptValue("");
      expect(result).toBe("");
    });

    it("returns null for corrupted encrypted values", async () => {
      const corrupted = "enc:v1:not-valid-base64!!!";
      const result = await decryptValue(corrupted);
      expect(result).toBeNull();
    });

    it("returns null for truncated encrypted values", async () => {
      // Encrypt something, then truncate the base64 data
      const encrypted = await encryptValue("test-value");
      const truncated = encrypted.slice(0, encrypted.length - 10);
      const result = await decryptValue(truncated);
      expect(result).toBeNull();
    });

    it("decrypts legacy enc:v1 values derived from the old runtime seed", async () => {
      const encrypted = encryptLegacyValue("legacy-secret");

      const result = await decryptValue(encrypted);

      expect(result).toBe("legacy-secret");
    });
  });
});
