import { prisma } from "@/lib/prisma";
const db = prisma as any;

const ACTIVE_STATUSES = ["pending", "preparing"] as const;
const DEFAULT_BASELINE_MINUTES = 12;
const SAFETY_BUFFER_MINUTES = 2;

function minutesToDate(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function diffMinutes(a: Date, b: Date) {
  return Math.max(1, Math.round((a.getTime() - b.getTime()) / (60 * 1000)));
}

function getTimeOfDayMultiplier(now = new Date()) {
  const hour = now.getHours();
  if ((hour >= 12 && hour < 14) || (hour >= 18 && hour < 20)) {
    return 1.15;
  }
  return 1;
}

function getLoadMultiplier(queueSize: number) {
  return 1 + Math.min(queueSize, 10) * 0.05;
}

export class QueueService {
  static async getRecentAveragePrepMinutes() {
    const readyOrders = await db.order.findMany({
      where: {
        status: "picked_up",
        preparingAt: { not: null },
        readyAt: { not: null },
      },
      select: { preparingAt: true, readyAt: true },
      orderBy: { readyAt: "desc" },
      take: 30,
    });

    if (readyOrders.length === 0) {
      return DEFAULT_BASELINE_MINUTES;
    }

    const values = readyOrders
      .filter(
        (o: { preparingAt?: Date | null; readyAt?: Date | null }): o is { preparingAt: Date; readyAt: Date } =>
          !!o.preparingAt && !!o.readyAt,
      )
      .map((o: { preparingAt: Date; readyAt: Date }) => diffMinutes(o.readyAt, o.preparingAt));

    if (values.length === 0) {
      return DEFAULT_BASELINE_MINUTES;
    }

    const avg = values.reduce((sum: number, value: number) => sum + value, 0) / values.length;
    return Math.max(5, Math.round(avg));
  }

  static async getQueueSummary() {
    const queueSize = await db.order.count({
      where: { status: { in: [...ACTIVE_STATUSES] } },
    });
    const baseline = await this.getRecentAveragePrepMinutes();
    const waitEstimate = Math.round(
      baseline * getLoadMultiplier(queueSize) * getTimeOfDayMultiplier() + SAFETY_BUFFER_MINUTES,
    );

    return {
      currentEstimatedWaitMinutes: waitEstimate,
      currentQueueSize: queueSize,
      rangeMinMinutes: Math.max(0, waitEstimate - 3),
      rangeMaxMinutes: waitEstimate + 5,
      updatedAt: new Date(),
    };
  }

  static async computeOrderEstimate(activeOrdersAhead: number) {
    const baseline = await this.getRecentAveragePrepMinutes();
    const loadMultiplier = getLoadMultiplier(activeOrdersAhead + 1);
    const timeMultiplier = getTimeOfDayMultiplier();
    const estimateMinutes = Math.round(
      baseline * (activeOrdersAhead + 1) * loadMultiplier * timeMultiplier + SAFETY_BUFFER_MINUTES,
    );

    return {
      estimateMinutes,
      rangeMinMinutes: Math.max(0, estimateMinutes - 4),
      rangeMaxMinutes: estimateMinutes + 6,
      estimatedReadyAt: minutesToDate(estimateMinutes),
    };
  }

  static async recalculateActiveOrderEtas() {
    const active = await db.order.findMany({
      where: { status: { in: [...ACTIVE_STATUSES] } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const updates = active.map(async (order: { id: string }, index: number) => {
      const eta = await this.computeOrderEstimate(index);
      return db.order.update({
        where: { id: order.id },
        data: { estimatedReadyAt: eta.estimatedReadyAt },
      });
    });

    await Promise.all(updates);
  }
}
