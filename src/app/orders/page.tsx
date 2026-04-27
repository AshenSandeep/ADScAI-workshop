import { OrderService } from "@/lib/services/order";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "user_demo";

function formatPrice(cents: number) {
  return `₹${(cents / 100).toFixed(2)}`;
}

export default async function OrdersPage() {
  const orders = await OrderService.listForUser(DEMO_USER_ID);

  return (
    <section>
      <h2>Your orders</h2>
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Showing orders for demo user <code>{DEMO_USER_ID}</code>.
      </p>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <article
          key={order.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <strong>#{order.id.slice(-6)}</strong>
            <span>
              {order.status} · {formatPrice(order.totalCents)}
            </span>
          </header>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {order.items.map((it) => (
              <li key={it.id}>
                {it.quantity}× {it.menuItem.name}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
              Notes: {order.notes}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
