import { MenuService } from "@/lib/services/menu";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return `₹${(cents / 100).toFixed(2)}`;
}

export default async function MenuPage() {
  const items = await MenuService.list();

  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <section>
      <h2>Menu</h2>
      {Object.entries(byCategory).map(([category, list]) => (
        <div key={category} style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ textTransform: "capitalize" }}>{category}</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {list.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                  opacity: item.available ? 1 : 0.5,
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {item.description}
                    </div>
                  )}
                  {!item.available && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#a00",
                        fontWeight: 600,
                      }}
                    >
                      sold out
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span>{formatPrice(item.priceCents)}</span>
                  <button disabled={!item.available} type="button">
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
