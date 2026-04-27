export type MenuCategory = "main" | "drink" | "snack";

export type OrderStatus = "pending" | "ready" | "picked_up";

export type CreateOrderInput = {
  items: Array<{ menuItemId: string; quantity: number }>;
  notes?: string;
};
