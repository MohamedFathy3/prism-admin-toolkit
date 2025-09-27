import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/api/api";
import { User, Order } from "@/type/type";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"revenue" | "commission">("revenue");
  
  // Pagination for orders table
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{ data: User }>(`/user/${id}`);
        setEmployee(res.data.user);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchEmployee();
  }, [id]);

  const toggleActive = async () => {
    if (!employee) return;
    try {
      await apiFetch(`/user/${employee.id}/active`, {
        method: "PUT",
        data: { active: !employee.active ? 1 : 0 },
      });
      setEmployee(prev => prev ? { ...prev, active: !prev.active } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  // إعداد بيانات الرسم البياني بشكل سلس (بدون تعرجات)
  const chartData = useMemo(() => {
    if (!employee?.orders) return [];
    
    // ترتيب الطلبات حسب التاريخ إذا موجود
    const sortedOrders = [...employee.orders].sort((a, b) => {
      const dateA = a.shipping_date ? new Date(a.shipping_date).getTime() : 0;
      const dateB = b.shipping_date ? new Date(b.shipping_date).getTime() : 0;
      return dateA - dateB;
    });

    return sortedOrders.map((order, index) => ({
      point: index + 1,
      revenue: parseFloat(order.price) || 0,
      commission: (parseFloat(order.price) * (employee.commission as number / 100)) || 0,
      orderId: order.id,
    }));
  }, [employee]);

  // Pagination for orders table
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = employee?.orders?.slice(indexOfFirstOrder, indexOfLastOrder) || [];
  const totalPages = Math.ceil((employee?.orders?.length || 0) / ordersPerPage);

  const chartConfig = {
    revenue: {
      label: "Total Revenue",
      color: "#3b82f6",
    },
    commission: {
      label: "Commission",
      color: "#10b981",
    },
  };

  const total = useMemo(() => ({
    revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    commission: chartData.reduce((acc, curr) => acc + curr.commission, 0),
  }), [chartData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The employee you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/employees')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{employee.user_name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Employee ID: #{employee.id}</p>
          </div>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="border-gray-300 dark:border-gray-600"
          >
            ← Back
          </Button>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Phone</CardDescription>
              <CardTitle className="text-xl">{employee.phone || 'N/A'}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Commission Rate</CardDescription>
              <CardTitle className="text-xl text-green-600">{employee.commission}%</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-xl">${employee.total_revenue || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Today's Orders</CardDescription>
              <CardTitle className="text-xl">{employee.today_orders_count || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Interactive Chart Card */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="flex flex-col items-stretch border-b border-gray-200 dark:border-gray-700 p-0">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Showing {activeChart === "revenue" ? "revenue" : "commission"} trend across orders
              </CardDescription>
            </div>
            <div className="flex">
              {(["revenue", "commission"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-gray-100 data-[active=true]:dark:bg-gray-700 flex flex-1 flex-col justify-center gap-1 border-t border-gray-200 dark:border-gray-700 px-6 py-4 text-left even:border-l even:border-gray-200 even:dark:border-gray-700 transition-colors hover:bg-gray-50 hover:dark:bg-gray-700/50"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-2xl font-bold">
                    ${total[key].toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid 
                    vertical={false} 
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="point"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `Order ${value}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, activeChart]}
                    labelFormatter={(label) => `Order ${label}`}
                  />
                  <Line
                    type="monotone"  // هذا يجعل الخط سلس بدون تعرجات
                    dataKey={activeChart}
                    stroke={chartConfig[activeChart].color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig[activeChart].color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: chartConfig[activeChart].color }}
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No order data available to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Table with Pagination */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Orders List ({employee.orders?.length || 0})</CardTitle>
            <CardDescription>
              All orders processed by this employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employee.orders && employee.orders.length > 0 ? (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Delivery Status</TableHead>
                        <TableHead>Shipping Date</TableHead>
                        <TableHead>Contact Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>${order.price}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.order_status === 'completed' ? 'default' : 
                              order.order_status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {order.order_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              order.delivery_status === 'delivered' ? 'default' : 
                              order.delivery_status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {order.delivery_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.shipping_date ? new Date(order.shipping_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="capitalize">
                            {order.contact_method || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, employee.orders.length)} of {employee.orders.length} orders
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No orders found for this employee
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status and Role Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Status</span>
                <Badge 
                  variant={employee.active ? "default" : "secondary"} 
                  className={`px-3 py-1 text-sm ${
                    employee.active 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {employee.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button 
                onClick={toggleActive}
                variant="outline"
                className="w-full mt-4 border-gray-300 dark:border-gray-600"
              >
                {employee.active ? "Deactivate Account" : "Activate Account"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Role</span>
                  <Badge variant="outline" className="capitalize">
                    {employee.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Commission Rate</span>
                  <span className="font-semibold">{employee.commission}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                  <span className="font-semibold">{employee.orders?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;