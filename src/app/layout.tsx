import type { ReactNode } from "react";

export const metadata = {
  title: "Canteen",
  description: "Pre-order canteen workshop app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: "1.5rem",
          maxWidth: "960px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ marginBottom: "0.25rem" }}>Canteen</h1>
          <nav style={{ display: "flex", gap: "1rem", fontSize: "0.95rem" }}>
            <a href="/menu">Menu</a>
            <a href="/orders">Orders</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
