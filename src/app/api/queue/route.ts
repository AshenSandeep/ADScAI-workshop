import { NextResponse } from "next/server";
import { QueueService } from "@/lib/services/queue";

export async function GET() {
  const queue = await QueueService.getQueueSummary();
  return NextResponse.json(queue);
}
