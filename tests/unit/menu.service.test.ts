import { describe, it, expect } from "vitest";
import { MenuService } from "@/lib/services/menu";

describe("MenuService", () => {
  it("filters out unavailable items", async () => {
    const items = MenuService.listAvailable([
      { id: "a", available: true, name: "biryani", priceCents: 350, category: "main" },
      { id: "b", available: false, name: "tea", priceCents: 50, category: "drink" },
    ]);
    expect(items.map((i) => i.id)).toEqual(["a"]);
  });
});
