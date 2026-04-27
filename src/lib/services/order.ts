import { prisma } from "@/lib/prisma";

export class OrderService {
  static async listForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(args: {
    userId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    notes?: string;
  }) {
    const { userId, items, notes } = args;

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) }, available: true },
    });

    const totalCents = items.reduce((sum, item) => {
      const m = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!m) return sum;
      return sum + m.priceCents * item.quantity;
    }, 0);

    return prisma.order.create({
      data: {
        userId,
        notes,
        totalCents,
        items: {
          create: items.map((item) => {
            const m = menuItems.find((mi) => mi.id === item.menuItemId);
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPriceCents: m?.priceCents ?? 0,
            };
          }),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });
  }

  static async byId(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { menuItem: true } } },
    });
  }

  static async updateStatus(id: string, userId: string, status: string) {
    const allowed = new Set(["pending", "ready", "picked_up"]);
    if (!allowed.has(status)) {
      throw new Error(`invalid status: ${status}`);
    }
    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) return null;
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { menuItem: true } } },
    });
  }

  static async remove(id: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) return null;
    return prisma.order.delete({ where: { id } });
  }
}
