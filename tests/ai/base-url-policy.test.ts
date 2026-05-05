import { describe, expect, it } from "vitest";
import { isAllowedAIBaseUrl } from "../../src/ai/base-url-policy.js";

describe("AI base URL policy", () => {
  it.each([
    "http://localhost:11434",
    "http://127.0.0.1:1234/v1",
    "http://127.10.20.30:11434",
    "http://[::1]:1234/v1",
    "https://api.openai.com/v1",
    "https://api.anthropic.com/v1",
    "https://openrouter.ai/api/v1",
    "https://api.groq.com/openai/v1",
    "https://generativelanguage.googleapis.com/v1beta/openai",
    "https://api.mistral.ai/v1",
    "https://api.deepseek.com/v1",
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "https://api.moonshot.cn/v1",
    "https://open.bigmodel.cn/api/paas/v4",
  ])("allows loopback and known HTTPS provider URL %s", (url) => {
    expect(isAllowedAIBaseUrl(url)).toBe(true);
  });

  it.each([
    "http://api.openai.com/v1",
    "http://192.168.1.10:11434",
    "https://192.168.1.10/v1",
    "http://10.0.0.2:11434",
    "https://api.openai.com.evil.test/v1",
    "https://example.com/v1",
    "file:///tmp/model.sock",
    "ftp://127.0.0.1/models",
    "not a url",
  ])("rejects unsafe AI base URL %s", (url) => {
    expect(isAllowedAIBaseUrl(url)).toBe(false);
  });
});
