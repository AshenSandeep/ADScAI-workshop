"use client";

import { useEffect, useState } from "react";

type StaffOrder = {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "picked_up",
  picked_up: null,
};

export default function StaffQueuePage() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/staff/queue", { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed (${res.status})`);
      return;
    }
    const payload = (await res.json()) as { orders: StaffOrder[] };
    setOrders(payload.orders);
    setError(null);
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, []);

  async function advance(order: StaffOrder) {
    const status = NEXT_STATUS[order.status];
    if (!status) return;
    const res = await fetch(`/api/staff/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed (${res.status})`);
      return;
    }
    await load();
  }

  return (
    <section>
      <h1 style={{ fontSize: "2rem", margin: "0 0 1rem" }}>Staff queue</h1>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {orders.map((order) => (
          <article key={order.id} className="card" style={{ padding: "0.9rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
              <div>
                <strong>#{order.id.slice(-6).toUpperCase()}</strong> - {order.status}
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  {order.user.name} ({order.user.email})
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!NEXT_STATUS[order.status]}
                onClick={() => advance(order)}
              >
                {NEXT_STATUS[order.status] ? `Mark ${NEXT_STATUS[order.status]}` : "Complete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
