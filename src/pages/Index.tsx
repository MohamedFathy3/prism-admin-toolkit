import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, FileText, TrendingUp, DollarSign } from "lucide-react";

const statsCards = [
  {
    title: "Total Employees",
    value: "24",
    change: "+2 this month",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Products",
    value: "157",
    change: "+12 new items",
    icon: Package,
    color: "text-green-600"
  },
  {
    title: "Orders",
    value: "89",
    change: "+23% from last month",
    icon: ShoppingCart,
    color: "text-purple-600"
  },
  {
    title: "Revenue",
    value: "$12,945",
    change: "+8.2% increase",
    icon: DollarSign,
    color: "text-emerald-600"
  }
];

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2">
                <div>
                  <p className="font-medium">Order #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Customer {i}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(Math.random() * 1000 + 100).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
              Create New Order
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              Add Employee
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              Generate Invoice
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;