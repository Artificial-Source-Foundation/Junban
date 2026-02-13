import { describe, it, expect, beforeEach } from "vitest";
import { createTestServices } from "./helpers.js";
import type { TagService } from "../../src/core/tags.js";

describe("TagService (integration)", () => {
  let tagService: TagService;

  beforeEach(() => {
    const services = createTestServices();
    tagService = services.tagService;
  });

  describe("create", () => {
    it("creates a tag with default color", async () => {
      const tag = await tagService.create("urgent");

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("urgent");
      expect(tag.color).toBe("#6b7280");
    });

    it("creates a tag with custom color", async () => {
      const tag = await tagService.create("priority", "#ef4444");

      expect(tag.name).toBe("priority");
      expect(tag.color).toBe("#ef4444");
    });

    it("normalizes name to lowercase and trims whitespace", async () => {
      const tag = await tagService.create("  URGENT  ");

      expect(tag.name).toBe("urgent");
    });
  });

  describe("list", () => {
    it("returns all tags", async () => {
      await tagService.create("a");
      await tagService.create("b");
      await tagService.create("c");

      const tags = await tagService.list();
      expect(tags).toHaveLength(3);
    });

    it("returns empty array when no tags exist", async () => {
      const tags = await tagService.list();
      expect(tags).toEqual([]);
    });
  });

  describe("getByName", () => {
    it("finds a tag by name", async () => {
      const created = await tagService.create("findme");

      const found = await tagService.getByName("findme");
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe("findme");
    });

    it("is case-insensitive", async () => {
      await tagService.create("CaseTest");

      const found = await tagService.getByName("CASETEST");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("casetest");
    });

    it("returns null for non-existent tag", async () => {
      const found = await tagService.getByName("nope");
      expect(found).toBeNull();
    });
  });

  describe("getOrCreate", () => {
    it("creates a new tag when it does not exist", async () => {
      const tag = await tagService.getOrCreate("brand-new");

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("brand-new");

      const tags = await tagService.list();
      expect(tags).toHaveLength(1);
    });

    it("returns existing tag when it already exists (idempotent)", async () => {
      const first = await tagService.getOrCreate("idempotent");
      const second = await tagService.getOrCreate("idempotent");

      expect(first.id).toBe(second.id);

      const tags = await tagService.list();
      expect(tags).toHaveLength(1);
    });

    it("is case-insensitive for lookup", async () => {
      const first = await tagService.getOrCreate("Mixed");
      const second = await tagService.getOrCreate("MIXED");

      expect(first.id).toBe(second.id);
    });
  });

  describe("delete", () => {
    it("deletes a tag", async () => {
      const tag = await tagService.create("temporary");

      const result = await tagService.delete(tag.id);
      expect(result).toBe(true);

      const tags = await tagService.list();
      expect(tags).toHaveLength(0);
    });

    it("returns false for non-existent tag", async () => {
      const result = await tagService.delete("nonexistent");
      expect(result).toBe(false);
    });
  });
});
