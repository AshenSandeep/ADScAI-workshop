import { prisma } from "@/lib/prisma";
import { QueueService } from "@/lib/services/queue";
const db = prisma as any;

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["preparing"],
  preparing: ["ready"],
  ready: ["picked_up"],
  picked_up: [],
};

function withEta(order: {
  estimatedReadyAt: Date | null;
  status: string;
  createdAt: Date;
}) {
  if (!order.estimatedReadyAt || order.status === "picked_up") {
    return {
      ...order,
      estimatedRemainingMinutes: null,
      estimatedRangeMinutes: null,
    };
  }
  const remainingMinutes = Math.max(
    0,
    Math.round((order.estimatedReadyAt.getTime() - Date.now()) / (60 * 1000)),
  );
  return {
    ...order,
    estimatedRemainingMinutes: remainingMinutes,
    estimatedRangeMinutes: {
      min: Math.max(0, remainingMinutes - 4),
      max: remainingMinutes + 6,
    },
  };
}

export class OrderService {
  static async listForUser(userId: string) {
    const orders = await db.order.findMany({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(withEta);
  }

  static async create(args: {
    userId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    notes?: string;
  }) {
    const { userId, items, notes } = args;

    const menuItems = await db.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) }, available: true },
    });

    const totalCents = items.reduce((sum, item) => {
      const m = menuItems.find(
        (mi: { id: string; priceCents: number }) => mi.id === item.menuItemId,
      );
      if (!m) return sum;
      return sum + m.priceCents * item.quantity;
    }, 0);

    const activeAhead = await db.order.count({
      where: { status: { in: ["pending", "preparing"] } },
    });
    const estimate = await QueueService.computeOrderEstimate(activeAhead);

    const created = await db.order.create({
      data: {
        userId,
        notes,
        totalCents,
        estimatedReadyAt: estimate.estimatedReadyAt,
        items: {
          create: items.map((item) => {
            const m = menuItems.find(
              (mi: { id: string; priceCents: number }) => mi.id === item.menuItemId,
            );
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
    await QueueService.recalculateActiveOrderEtas();
    return withEta(created);
  }

  static async byId(id: string, userId: string) {
    const order = await db.order.findFirst({
      where: { id, userId },
      include: { items: { include: { menuItem: true } } },
    });
    return order ? withEta(order) : null;
  }

  static async listActiveQueue() {
    return db.order.findMany({
      where: { status: { in: ["pending", "preparing", "ready"] } },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async transitionStatus(id: string, status: string) {
    if (!STATUS_TRANSITIONS[status] && status !== "picked_up") {
      throw new Error(`invalid status: ${status}`);
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return null;
    }

    const nextAllowed = STATUS_TRANSITIONS[order.status] ?? [];
    if (!nextAllowed.includes(status)) {
      throw new Error(`invalid transition: ${order.status} -> ${status}`);
    }

    const now = new Date();
    const updateData: {
      status: string;
      preparingAt?: Date;
      readyAt?: Date;
      pickedUpAt?: Date;
    } = { status };
    if (status === "preparing") updateData.preparingAt = now;
    if (status === "ready") updateData.readyAt = now;
    if (status === "picked_up") updateData.pickedUpAt = now;

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: { include: { menuItem: true } } },
    });
    await QueueService.recalculateActiveOrderEtas();
    return withEta(updated);
  }

  static async updateStatus(id: string, userId: string, status: string) {
    const order = await db.order.findFirst({ where: { id, userId } });
    if (!order) return null;
    const allowed = new Set(["pending", "preparing", "ready", "picked_up"]);
    if (!allowed.has(status)) {
      throw new Error(`invalid status: ${status}`);
    }
    const updated = await db.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { menuItem: true } } },
    });
    return withEta(updated);
  }

  static async remove(id: string, userId: string) {
    const order = await db.order.findFirst({ where: { id, userId } });
    if (!order) return null;
    return db.order.delete({ where: { id } });
  }
}
