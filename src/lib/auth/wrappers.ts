import { NextRequest, NextResponse } from "next/server";

export type AuthContext = {
  userId: string;
};

type Handler = (
  req: NextRequest,
  ctx: AuthContext,
  params?: any,
) => Promise<NextResponse>;

/**
 * withAuth — minimal auth wrapper for the workshop.
 *
 * In a real app this validates a session cookie / JWT.
 * For the workshop we read `x-user-id` header and reject if missing.
 */
export function withAuth(handler: Handler) {
  return async (req: NextRequest, ctx?: any) => {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return handler(req, { userId }, ctx);
  };
}
