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
  void req;
  void auth;
  void ctx;
  return NextResponse.json(
    { error: "status updates are staff-only" },
    { status: 403 },
  );
});

export const DELETE = withAuth(async (_req, auth, ctx: Ctx) => {
  const { id } = await ctx.params;
  const removed = await OrderService.remove(id, auth.userId);
  if (!removed) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
});
