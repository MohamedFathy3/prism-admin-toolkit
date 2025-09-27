/* ========== USER ========== */
export interface User {
  id?: number;
  user_name: string;
  phone: string | null;
  commission: number | string | null;
  password?: string; // مش هتجيلك في response غالبًا
  active: boolean | number;
  role: "admin" | "employee" | "customer" | string;
}

/* ========== PRODUCT ========== */
export interface Product {
  id?: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  image: string | number; // ممكن يكون ID للملف أو URL
}

/* ========== CUSTOMER ========== */
export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address: string;
}

/* ========== ORDER ========== */
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type DeliveryStatus = "pending" | "shipped" | "delivered" | "returned";

export interface Order {
  id?: number;
  price: number;
  order_status: OrderStatus;
  delivery_status: DeliveryStatus;
  note?: string;
  shipping_date?: string; // ISO string "2025-10-01 10:00:00"
  contact_method: "store" | "phone" | "online" | string;
  customer_id: number;
  customer?: Customer; // ممكن ترجع البيانات كاملة
  products?: OrderProduct[];
}

export interface OrderProduct {
  id: number; // product_id
  quantity: number;
  product?: Product;
}

/* ========== PACK ========== */
export interface PackProduct {
  id: number; // product_id
  quantity: number;
}

export interface Pack {
  id?: number;
  name: string;
  price: number;
  stock: number;
  products: PackProduct[];
  image: string | number;
}

/* ========== AUTH RESPONSES ========== */
export interface LoginResponse {
  result: string; // "Success"
  data: User & {
    orders: Order[];
    total_revenue: number;
    user_commission: number;
    system_commission: number;
    today_orders_count: number;
  };
  message: string;
  status: boolean;
  token: string;
}

export interface CheckAuthResponse {
  result: string;
  data: User & {
    orders: Order[];
    total_revenue: number;
    user_commission: number;
    system_commission: number;
    today_orders_count: number;
  };
  today_orders: Order[];
  message: string;
  status: boolean;
}
