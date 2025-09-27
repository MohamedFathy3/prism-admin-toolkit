import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, FileText, TrendingUp, DollarSign, Calendar, Clock, Truck, Eye, Download, BarChart3, Settings, UserPlus, PieChart, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats Cards Data - باستخدام البيانات الحقيقية
  const statsCards = [
    {
      title: "Role",
      value: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      change: "",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Orders",
      value: user.orders ? user.orders.length : 0,
      change: `Today: ${user.today_orders_count || 0}`,
      icon: ShoppingCart,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Total Revenue",
      value: `$${parseFloat(user.total_revenue || 0).toLocaleString()}`,
      change: user.reports?.last_month?.revenue > 0 ? "+5% this month" : "No data yet",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Commission Rate",
      value: `${user.commission || 0}%`,
      change: "Your commission percentage",
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  // Date Reports Cards - باستخدام البيانات الحقيقية من الـ API
  const dateReportsCards = [
    {
      title: "Today",
      period: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      revenue: user.reports?.today?.revenue || 0,
      orders: user.reports?.today?.orders || 0,
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
      change: user.reports?.yesterday?.revenue ? 
        `${((user.reports.today.revenue - user.reports.yesterday.revenue) / user.reports.yesterday.revenue * 100).toFixed(1)}%` 
        : "0%",
      trend: user.reports?.yesterday?.revenue && user.reports.today.revenue > user.reports.yesterday.revenue ? "up" : "down"
    },
    {
      title: "Yesterday",
      period: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
      revenue: user.reports?.yesterday?.revenue || 0,
      orders: user.reports?.yesterday?.orders || 0,
      icon: Calendar,
      gradient: "from-purple-500 to-purple-600",
      change: user.reports?.last_week?.revenue ? 
        `${((user.reports.yesterday.revenue - user.reports.last_week.revenue) / user.reports.last_week.revenue * 100).toFixed(1)}%` 
        : "0%",
      trend: user.reports?.last_week?.revenue && user.reports.yesterday.revenue > user.reports.last_week.revenue ? "up" : "down"
    },
    {
      title: "Last Week",
      period: "7 days period",
      revenue: user.reports?.last_week?.revenue || 0,
      orders: user.reports?.last_week?.orders || 0,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      change: user.reports?.last_month?.revenue ? 
        `${((user.reports.last_week.revenue - user.reports.last_month.revenue) / user.reports.last_month.revenue * 100).toFixed(1)}%` 
        : "0%",
      trend: user.reports?.last_month?.revenue && user.reports.last_week.revenue > user.reports.last_month.revenue ? "up" : "down"
    },
    {
      title: "Last Month",
      period: "30 days period",
      revenue: user.reports?.last_month?.revenue || 0,
      orders: user.reports?.last_month?.orders || 0,
      icon: BarChart3,
      gradient: "from-orange-500 to-orange-600",
      change: "Baseline period",
      trend: "up"
    }
  ];

  // Generate chart data from real orders
  const generateChartData = () => {
    if (!user.orders || user.orders.length === 0) {
      return {
        revenueData: [],
        ordersData: []
      };
    }

    // Group orders by day
    const ordersByDay = user.orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += parseFloat(order.price || 0);
      acc[date].orders += 1;
      return acc;
    }, {});

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const revenueData = daysOfWeek.map(day => ({
      name: day,
      revenue: ordersByDay[day]?.revenue || 0
    }));

    const ordersData = daysOfWeek.map(day => ({
      name: day,
      orders: ordersByDay[day]?.orders || 0
    }));

    return { revenueData, ordersData };
  };

  const { revenueData, ordersData } = generateChartData();

  // Quick Actions
  const quickActions = [
    {
      title: "Create Order",
      description: "Add new customer order",
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      onClick: () => navigate("/customers"), // 👈 بدّل console بالـ navigate
    },
    {
      title: "View Reports",
      description: "Analytics & insights",
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      onClick: () => setActiveTab("reports")
    },
    {
      title: "Manage Profile",
      description: "Update your information",
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      onClick: () => console.log("Manage Profile")
    },
    {
      title: "Settings",
      description: "System configuration",
      icon: Settings,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      onClick: () => console.log("Settings")
    }
  ];

  // Order Status Badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      processing: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
    };
    
    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, <span className="font-medium text-primary">{user.user_name}</span>
          {user.role === 'employee' && ` (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`}
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, index) => (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Date Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dateReportsCards.map((report, index) => (
              <Card key={index} className="relative overflow-hidden border-0 text-white">
                <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient}`}></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      <p className="text-sm opacity-90">{report.period}</p>
                    </div>
                    <div className="p-3 rounded-full bg-white/20">
                      <report.icon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Revenue</span>
                      <span className="text-xl font-bold">${report.revenue}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Orders</span>
                      <span className="text-xl font-bold">{report.orders}</span>
                    </div>
                    
                    <div className={`flex items-center text-xs mt-2 ${
                      report.trend === 'up' ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {report.trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {report.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders {user.orders && user.orders.length > 0 && `(${user.orders.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.orders && user.orders.length > 0 ? (
                <div className="space-y-4">
                  {user.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Order #{order.id}</span>
                          {getStatusBadge(order.order_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} • {formatTime(order.created_at)}
                        </p>
                        {order.note && (
                          <p className="text-sm text-muted-foreground italic">Note: {order.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.price}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.contact_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No orders found</p>
                  <Button className="mt-4" onClick={() => setActiveTab("actions")}>
                    Create Your First Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {user.orders && user.orders.length > 0 ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Revenue Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{day.name}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ 
                                  width: revenueData.some(d => d.revenue > 0) 
                                    ? `${(day.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100}%` 
                                    : '0%' 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">${day.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Orders Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      Orders Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ordersData.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{day.name}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: ordersData.some(d => d.orders > 0) 
                                    ? `${(day.orders / Math.max(...ordersData.map(d => d.orders))) * 100}%` 
                                    : '0%' 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{day.orders} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Revenue</p>
                        <p className="text-2xl font-bold">${user.total_revenue || 0}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Orders</p>
                        <p className="text-2xl font-bold">{user.orders.length}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Your Commission</p>
                        <p className="text-2xl font-bold">${user.user_commission || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">Start creating orders to see analytics and reports</p>
                <Button onClick={() => setActiveTab("actions")}>
                  Create Your First Order
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Orders ({user.orders ? user.orders.length : 0})</span>
                <Button size="sm" onClick={() => setActiveTab("actions")}>
                  Create New Order
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.orders && user.orders.length > 0 ? (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">Order #{order.id}</span>
                          {getStatusBadge(order.order_status)}
                          {order.delivery_status && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {order.delivery_status}
                            </Badge>
                          )}
                        </div>
                        <span className="font-bold text-xl text-primary">${order.price}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Date:</strong> {formatDate(order.created_at)}
                        </div>
                        <div>
                          <strong>Time:</strong> {formatTime(order.created_at)}
                        </div>
                        <div>
                          <strong>Contact:</strong> {order.contact_method || 'N/A'}
                        </div>
                      </div>
                      
                      {order.note && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <strong>Note:</strong> {order.note}
                        </div>
                      )}
                      
                      {order.shipping_date && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Shipping Date:</strong> {formatDate(order.shipping_date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No orders found</p>
                  <Button className="mt-4" onClick={() => setActiveTab("actions")}>
                    Create Your First Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 border"
                onClick={action.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Commission Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Your Commission</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${user.user_commission || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Earnings from orders</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Commission Rate</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {user.commission || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Your commission percentage</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;