import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingBag, Package, ShoppingCart, X, Plus,
  User, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product { id: number; name: string; price: number; stock: number; image?: string; }
interface Pack { id: number; name: string; price: number; stock: number; image?: string; products: { id: number; quantity: number }[]; }
interface Customer { id: number; name: string; email: string; phone?: string; city?: string; image?: string; }
interface OrderItem { type: 'product' | 'pack'; id: number; name: string; price: number; quantity: number; image?: string; }

const CreateOrderPage = () => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchPack, setSearchPack] = useState("");

  const [orderDetails, setOrderDetails] = useState({
    note: "",
    delivery_status: "pending",
    contact_method: "phone",
    shipping_date: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (id) fetchCustomer(id);
    fetchProducts();
    fetchPacks();
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    try {
      const res = await apiFetch(`/customer/${customerId}`);
      setCustomer(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load customer details", variant: "destructive" });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("/product/index", { method: "POST", data: { perPage: 100, paginate: false } });
      setProducts((res?.data?.data || res?.data || []).map((p: any) => ({ ...p, price: Number(p.price) })));
    } catch {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    }
  };

  const fetchPacks = async () => {
    try {
      const res = await apiFetch("/pack/index", { method: "POST", data: { perPage: 100, paginate: false } });
      setPacks((res?.data?.data || res?.data || []).map((p: any) => ({ ...p, price: Number(p.price) })));
    } catch {
      toast({ title: "Error", description: "Failed to load packs", variant: "destructive" });
    }
  };

  const addItem = (item: Product | Pack, type: 'product' | 'pack') => {
    const exists = orderItems.find(o => o.type === type && o.id === item.id);
    if (exists) {
      setOrderItems(prev => prev.map(o =>
        o.type === type && o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
      ));
    } else {
      setOrderItems(prev => [...prev, { type, id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }]);
    }
    toast({ title: "Added ✅", description: `${item.name} added to order` });
  };

  const removeItem = (type: 'product' | 'pack', id: number) => {
    setOrderItems(prev => prev.filter(i => !(i.type === type && i.id === id)));
    toast({ title: "Removed", description: "Item removed from order" });
  };

  const updateQuantity = (type: 'product' | 'pack', id: number, q: number) => {
    if (q < 1) return removeItem(type, id);
    setOrderItems(prev => prev.map(i => i.type === type && i.id === id ? { ...i, quantity: q } : i));
  };

  const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()));
  const filteredPacks = packs.filter(p => p.name.toLowerCase().includes(searchPack.toLowerCase()));

  const createOrder = async () => {
    if (!customer) return toast({ title: "Error", description: "Select a customer", variant: "destructive" });
    if (orderItems.length === 0) return toast({ title: "Error", description: "Add items first", variant: "destructive" });

    setLoading(true);
    try {
      const res = await apiFetch("/order", {
        method: "POST",
        data: {
          customer_id: customer.id,
         
          order_status: "processing",
          delivery_status: orderDetails.delivery_status,
          note: orderDetails.note,
          shipping_date: orderDetails.shipping_date,
          contact_method: orderDetails.contact_method,
           products: orderItems
      .filter(i => i.type === 'product')
      .map(i => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity
      })),


pack_id: orderItems.map(i => i.id)


    
    
    
    
    
    }
      });
      if (res.data?.success) {
        toast({ title: "Success 🎉", description: "Order created successfully" });
        setOrderItems([]);
      } else throw new Error();
    } catch {
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage and track customer orders easily</p>
        </div>

        {/* Customer Info */}
        {customer && (
          <Card className="bg-white/80 dark:bg-gray-800 shadow-lg">
            <CardHeader><CardTitle className="flex gap-2 items-center text-xl"><User />Customer</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/30"><p className="text-sm">Name</p><p className="font-semibold">{customer.name}</p></div>
                {customer.phone && <div className="p-3 rounded bg-orange-50 dark:bg-orange-900/30"><p className="text-sm">Phone</p><p className="font-semibold">{customer.phone}</p></div>}
                {customer.city && <div className="p-3 rounded bg-purple-50 dark:bg-purple-900/30"><p className="text-sm">City</p><p className="font-semibold">{customer.city}</p></div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products & Packs */}
        <Card className="bg-white/80 dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center"><ShoppingCart />Add Items</CardTitle>
            <CardDescription>Select products or packs to add</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

         
              <Dialog open={packModalOpen} onOpenChange={setPackModalOpen}>
                <DialogTrigger asChild>
                  <Button className="h-28 sm:h-32 flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <Package className="h-8 w-8" /><div>{packs.length} Packs</div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full sm:max-w-5xl h-[90vh] flex flex-col">
                  <DialogHeader><DialogTitle>Select Packs</DialogTitle></DialogHeader>
                  <Input placeholder="Search..." value={searchPack} onChange={e => setSearchPack(e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {filteredPacks.map(pack => (
                      <Card key={pack.id} className="p-3">
                        <img src={pack.image || "/api/placeholder/200/200"} alt={pack.name} className="w-full h-40 object-cover rounded" />
                        <h3 className="font-semibold mt-2">{pack.name}</h3>
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-green-600 font-bold">${pack.price.toFixed(2)}</span>
                          <Badge variant="outline">Stock: {pack.stock}</Badge>
                        </div>
                        <Button onClick={() => addItem(pack, 'pack')} className="mt-3 w-full bg-purple-600 hover:bg-purple-700"><Plus />Add</Button>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

            </div>
          </CardContent>
        </Card>

        {/* Order Items Table */}
        {orderItems.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800 shadow-lg">
            <CardHeader><CardTitle><ShoppingCart /> Selected Items ({orderItems.length})</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell><img src={item.image || "/api/placeholder/50/50"} alt="" className="w-10 h-10 rounded" /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell><Badge>{item.type}</Badge></TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Button size="sm" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.type, item.id, item.quantity - 1)}>-</Button>
                          <span>{item.quantity}</span>
                          <Button size="sm" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.type, item.id, item.quantity + 1)}>+</Button>
                        </div>
                      </TableCell>
                      <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell><Button size="sm" variant="destructive" onClick={() => removeItem(item.type, item.id)}><X /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="bg-white/80 dark:bg-gray-800 shadow-lg">
          <CardHeader><CardTitle><MessageCircle /> Order Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Delivery Status</Label>
                <Select value={orderDetails.delivery_status} onValueChange={v => setOrderDetails(p => ({ ...p, delivery_status: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contact Method</Label>
                <Select value={orderDetails.contact_method} onValueChange={v => setOrderDetails(p => ({ ...p, contact_method: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="store">In-Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Shipping Date</Label>
                <Input type="datetime-local" value={orderDetails.shipping_date} onChange={e => setOrderDetails(p => ({ ...p, shipping_date: e.target.value }))} />
              </div>
              <div className="lg:col-span-4">
                <Label>Notes</Label>
                <Input placeholder="Any notes..." value={orderDetails.note} onChange={e => setOrderDetails(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button onClick={createOrder} disabled={loading || orderItems.length === 0 || !customer}
            className="gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-lg">
            <ShoppingCart /> {loading ? "Creating..." : `Create Order - $${totalPrice.toFixed(2)}`}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default
CreateOrderPage;