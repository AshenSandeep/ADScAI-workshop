import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthContext = {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    isStaff: boolean;
  };
};

type Handler = (
  req: NextRequest,
  ctx: AuthContext,
  params?: any,
) => Promise<NextResponse>;

/**
 * withAuth — resolves the better-auth session from the request cookies and
 * passes the authenticated user to the handler. Returns 401 if no session.
 */
export function withAuth(handler: Handler) {
  return async (req: NextRequest, ctx?: any) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT "isStaff" FROM "user" WHERE "id" = ? LIMIT 1',
      session.user.id,
    )) as Array<{ isStaff: boolean }>;
    const isStaff = rows[0]?.isStaff ?? false;
    const authCtx: AuthContext = {
      userId: session.user.id,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isStaff,
      },
    };
    return handler(req, authCtx, ctx);
  };
}

export function withStaffAuth(handler: Handler) {
  return withAuth(async (req, ctx, params) => {
    if (!ctx.user.isStaff) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return handler(req, ctx, params);
  });
}
