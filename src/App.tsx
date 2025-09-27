import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Orderscanceled from "./pages/Orderscanceled";
import Orderscompleted from "./pages/Orderscompleted";
import OrderProcessing from "./pages/OrdersProcessing";
import CreateOrder from "./pages/Orders";
import Packages from "./pages/Packages";
import Costing from "./pages/Costing";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import OrderCustomer from "./pages/ordercustmer";
import EmployeeDetails from "./pages/EmployeeDetails";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
              <Route path="/employees" element={<DashboardLayout><Employees /></DashboardLayout>} />
              <Route path="/employee/:id" element={<DashboardLayout><EmployeeDetails /></DashboardLayout>} />
              <Route path="/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
              <Route path="/products" element={<DashboardLayout><Products /></DashboardLayout>} />
              <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
              <Route path="/order/customer" element={<DashboardLayout><OrderCustomer /></DashboardLayout>} />
              <Route path="/orderscanceled" element={<DashboardLayout><Orderscanceled /></DashboardLayout>} />
              <Route path="/orderscompleted" element={<DashboardLayout><Orderscompleted /></DashboardLayout>} />
              <Route path="/OrderProcessing" element={<DashboardLayout><OrderProcessing /></DashboardLayout>} />
              <Route path="/orders/create/:id" element={<DashboardLayout><CreateOrder /></DashboardLayout>} />
              <Route path="/packages" element={<DashboardLayout><Packages /></DashboardLayout>} />
              <Route path="/costing" element={<DashboardLayout><Costing /></DashboardLayout>} />
              <Route path="/invoices" element={<DashboardLayout><Invoices /></DashboardLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
