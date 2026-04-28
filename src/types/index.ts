export type MenuCategory = "main" | "drink" | "snack";

export type OrderStatus = "pending" | "preparing" | "ready" | "picked_up";

export type CreateOrderInput = {
  items: Array<{ menuItemId: string; quantity: number }>;
  notes?: string;
};
