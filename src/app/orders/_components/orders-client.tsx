"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OrderItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  menuItem: { name: string };
};

type Order = {
  id: string;
  status: string;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  preparingAt: string | null;
  readyAt: string | null;
  pickedUpAt: string | null;
  estimatedReadyAt: string | null;
  estimatedRemainingMinutes: number | null;
  items: OrderItem[];
};

type QueueSummary = {
  currentEstimatedWaitMinutes: number;
  currentQueueSize: number;
  rangeMinMinutes: number;
  rangeMaxMinutes: number;
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "badge badge-pending";
  if (s === "preparing") return "badge badge-preparing";
  if (s === "ready") return "badge badge-ready";
  if (s === "picked_up" || s === "collected" || s === "completed") return "badge badge-collected";
  if (s === "cancelled" || s === "canceled") return "badge badge-cancelled";
  return "badge";
}

export function OrdersClient({
  initialOrders,
  initialQueue,
}: {
  initialOrders: Order[] | any[];
  initialQueue: QueueSummary | null | any;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [queue, setQueue] = useState(initialQueue);
  const [readyNotice, setReadyNotice] = useState<string | null>(null);
  const previousStatuses = useRef<Record<string, string>>(
    Object.fromEntries(initialOrders.map((o) => [o.id, o.status])),
  );

  useEffect(() => {
    async function refreshOrders() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as { orders: Order[]; queue: QueueSummary };
        for (const order of payload.orders) {
          const previous = previousStatuses.current[order.id];
          if (previous && previous !== "ready" && order.status === "ready") {
            setReadyNotice(
              `Order #${order.id.slice(-6).toUpperCase()} is ready for pickup (${new Date().toLocaleTimeString()}).`,
            );
          }
        }
        previousStatuses.current = Object.fromEntries(payload.orders.map((o) => [o.id, o.status]));
        setOrders(payload.orders);
        setQueue(payload.queue);
      } catch {
        // Silent background refresh failure.
      }
    }
    const id = window.setInterval(refreshOrders, 15000);
    return () => window.clearInterval(id);
  }, []);

  const empty = useMemo(() => orders.length === 0, [orders]);

  return (
    <section>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "2rem", margin: "0 0 0.4rem" }}>Your orders</h1>
      </div>

      {queue && (
        <div className="card" style={{ marginBottom: "1rem", padding: "0.8rem 1rem" }}>
          <strong>{queue.rangeMinMinutes}-{queue.rangeMaxMinutes} min wait</strong>
          <span style={{ marginLeft: "0.75rem", color: "var(--muted)", fontSize: "0.9rem" }}>
            {queue.currentQueueSize} active orders
          </span>
        </div>
      )}

      {readyNotice && (
        <div
          style={{
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "0.8rem 1rem",
            borderRadius: "var(--radius)",
            marginBottom: "1rem",
          }}
        >
          {readyNotice}
        </div>
      )}

      {empty && (
        <div className="card" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.4rem" }}>No orders yet</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 1rem", fontSize: "0.9rem" }}>
            Browse the menu and place your first pre-order.
          </p>
          <a href="/menu" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Browse menu
          </a>
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem" }}>
        {orders.map((order) => (
          <article key={order.id} className="card" style={{ padding: "1.1rem 1.25rem" }}>
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: "0.85rem",
                paddingBottom: "0.85rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <strong style={{ fontSize: "1.05rem", fontVariantNumeric: "tabular-nums" }}>
                  #{order.id.slice(-6).toUpperCase()}
                </strong>
                <span className={badgeClass(order.status)} style={{ marginLeft: "0.6rem" }}>
                  {order.status}
                </span>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <strong style={{ fontSize: "1.15rem", fontVariantNumeric: "tabular-nums" }}>
                {formatPrice(order.totalCents)}
              </strong>
            </header>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.35rem" }}>
              {order.items.map((it: OrderItem) => (
                <li key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span>
                    <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums", marginRight: "0.5rem" }}>
                      {it.quantity}x
                    </span>
                    {it.menuItem.name}
                  </span>
                  <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(it.unitPriceCents * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "0.85rem", fontSize: "0.85rem", color: "var(--muted)" }}>
              <div>Estimated ready: {formatDate(order.estimatedReadyAt)}</div>
              <div>Remaining: {order.estimatedRemainingMinutes ?? "N/A"} min</div>
              <div>Preparing at: {formatDate(order.preparingAt)}</div>
              <div>Ready at: {formatDate(order.readyAt)}</div>
              <div>Picked up at: {formatDate(order.pickedUpAt)}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
