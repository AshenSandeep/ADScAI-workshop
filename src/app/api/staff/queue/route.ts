import { NextResponse } from "next/server";
import { withStaffAuth } from "@/lib/auth/wrappers";
import { OrderService } from "@/lib/services/order";
import { QueueService } from "@/lib/services/queue";

export const GET = withStaffAuth(async () => {
  const [orders, queue] = await Promise.all([
    OrderService.listActiveQueue(),
    QueueService.getQueueSummary(),
  ]);
  return NextResponse.json({ orders, queue });
});
