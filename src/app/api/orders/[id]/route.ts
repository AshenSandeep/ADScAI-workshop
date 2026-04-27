import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/wrappers";
import { OrderService } from "@/lib/services/order";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req, auth, ctx: Ctx) => {
  const { id } = await ctx.params;
  const order = await OrderService.byId(id, auth.userId);
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(order);
});

export const PATCH = withAuth(async (req, auth, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  if (typeof body.status !== "string") {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }
  try {
    const order = await OrderService.updateStatus(id, auth.userId, body.status);
    if (!order) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalid request" },
      { status: 400 },
    );
  }
});

export const DELETE = withAuth(async (_req, auth, ctx: Ctx) => {
  const { id } = await ctx.params;
  const removed = await OrderService.remove(id, auth.userId);
  if (!removed) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
});
