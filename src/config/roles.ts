// src/config/roles.ts
export const rolePermissions: Record<string, string[]> = {
  admin: [
    "Dashboard",
    "Employees",
    "Products",
    "Orders",
    "orders_canceled",
    "orders_completed",
    "Order_Processing",
    "Create Order",
    "Packages",
    "Costing",
    "Invoices",
    "Customers",
    "Orders_Pending",
  ],
  employee: ["Dashboard", "Orders", "Customers", 'OrderCustomer'],
  guest: ["Dashboard", "Login", "Register"],
};
