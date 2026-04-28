import { NextResponse } from "next/server";
import { withStaffAuth } from "@/lib/auth/wrappers";
import { OrderService } from "@/lib/services/order";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withStaffAuth(async (req, _auth, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  if (typeof body.status !== "string") {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }
  try {
    const updated = await OrderService.transitionStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    console.info("order.status.transition", {
      orderId: id,
      actorId: _auth.userId,
      status: body.status,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid request" },
      { status: 400 },
    );
  }
});
