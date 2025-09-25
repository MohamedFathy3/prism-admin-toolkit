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
import CreateOrder from "./pages/CreateOrder";
import Packages from "./pages/Packages";
import Costing from "./pages/Costing";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <DashboardLayout>
                <Index />
              </DashboardLayout>
            } />
            <Route path="/employees" element={
              <DashboardLayout>
                <Employees />
              </DashboardLayout>
            } />
            <Route path="/products" element={
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            } />
            <Route path="/orders" element={
              <DashboardLayout>
                <Orders />
              </DashboardLayout>
            } />
            <Route path="/create-order" element={
              <DashboardLayout>
                <CreateOrder />
              </DashboardLayout>
            } />
            <Route path="/packages" element={
              <DashboardLayout>
                <Packages />
              </DashboardLayout>
            } />
            <Route path="/costing" element={
              <DashboardLayout>
                <Costing />
              </DashboardLayout>
            } />
            <Route path="/invoices" element={
              <DashboardLayout>
                <Invoices />
              </DashboardLayout>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
