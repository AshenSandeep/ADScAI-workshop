import { prisma } from "@/lib/prisma";

type MenuItemLike = {
  id: string;
  available: boolean;
  name: string;
  priceCents: number;
  category: string;
};

export class MenuService {
  static async list() {
    return prisma.menuItem.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  static async listAvailableFromDb() {
    return prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Pure helper used by the unit test — filters an in-memory list. Kept
   * separate from the DB methods so it can be exercised without a live db.
   */
  static listAvailable<T extends MenuItemLike>(items: T[]): T[] {
    return items.filter((i) => i.available);
  }
}
