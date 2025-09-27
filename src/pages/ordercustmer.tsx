import { useState, useEffect } from "react";
import { apiFetch } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  user_name: string;
}

interface Order {
  id: number;
  price: string;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  delivery_status: string;
  shipping_date: string;
  user: User;
}

const Orders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: Order[], meta: { last_page: number } }>("/order/index", {
        method: "POST",
        data: {
          filters: { user_id: user?.id },
          orderBy: "id",
          orderByDirection: "asc",
          perPage,
          paginate: true,
          deleted: false,
        },
      });
      setOrders(res.data || []);
      setTotalPages(res.meta?.last_page || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders(currentPage);
  }, [user, currentPage]);

  // العد لكل حالة
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    },
    {} as Record<Order['order_status'], number>
  );

  const getStatusBadge = (status: Order['order_status']) => {
    const colors = {
      'pending': 'bg-yellow-500 text-white',
      'processing': 'bg-blue-500 text-white',
      'completed': 'bg-green-500 text-white',
      'cancelled': 'bg-red-500 text-white'
    };
    return <Badge className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredOrders = orders.filter(order =>
    order.user?.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.delivery_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* الكروت الأربع للحالات */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(['pending', 'processing', 'completed', 'cancelled'] as Order['order_status'][]).map(status => (
          <Card key={status} className="bg-gradient-card border-0 shadow-md">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{status.charAt(0).toUpperCase() + status.slice(1)} Orders</p>
                <p className="text-2xl font-bold">
                  {statusCounts[status] || 0}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                status === 'pending' ? 'bg-yellow-100' :
                status === 'processing' ? 'bg-blue-100' :
                status === 'completed' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
                <div className={`h-4 w-4 rounded-full ${
                  status === 'pending' ? 'bg-yellow-500' :
                  status === 'processing' ? 'bg-blue-500' :
                  status === 'completed' ? 'bg-green-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* جدول الطلبات */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Orders</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Shipping Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.user?.user_name || "N/A"}</TableCell>
                    <TableCell>${parseFloat(order.price).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                    <TableCell>{order.delivery_status}</TableCell>
                    <TableCell>{new Date(order.shipping_date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
