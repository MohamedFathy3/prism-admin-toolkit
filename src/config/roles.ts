// src/config/roles.ts
export const rolePermissions: Record<string, string[]> = {
  admin: [
    "Dashboard",
    "Employees",
    "Products",
    "Orders",
    "orderscanceled",
    "orderscompleted",
    "orderspending",
    "Create Order",
    "Packages",
    "Costing",
    "Invoices",
    "Customers",
    'OrderProcessing',
  ],
  employee: ["Dashboard", "Orders", "Customers", 'OrderCustomer'],
  guest: ["Dashboard", "Login", "Register"],
};
