import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Package {
  id: string;
  name: string;
  price: number;
  products: string[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'package';
}

const CreateOrder = () => {
  const { toast } = useToast();
  
  // Mock data
  const employees: Employee[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
  ];

  const products: Product[] = [
    { id: '1', name: 'Wireless Headphones', price: 99.99 },
    { id: '2', name: 'Coffee Mug', price: 15.99 },
    { id: '3', name: 'Laptop Stand', price: 45.00 },
  ];

  const packages: Package[] = [
    { id: '1', name: 'Office Bundle', price: 120.00, products: ['2', '3'] },
    { id: '2', name: 'Tech Bundle', price: 140.00, products: ['1', '3'] },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [orderType, setOrderType] = useState<'products' | 'packages'>('products');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');

  const addItem = (item: Product | Package, quantity: number = 1) => {
    const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + quantity }
          : orderItem
      ));
    } else {
      setOrderItems([...orderItems, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        type: orderType === 'products' ? 'product' : 'package'
      }]);
    }

    toast({
      title: "Item Added",
      description: `${item.name} added to order`
    });
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item removed from order"
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (!selectedEmployee || !customerName || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add items to the order",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the order to your backend
    toast({
      title: "Success",
      description: `Order created successfully for ${customerName}!`
    });

    // Reset form
    setSelectedEmployee('');
    setCustomerName('');
    setOrderItems([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
        <p className="text-muted-foreground">Create a new order by selecting employee and products/packages</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Details */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee *</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value: 'products' | 'packages') => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Individual Products</SelectItem>
                  <SelectItem value="packages">Product Packages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Available Items */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle>Available {orderType === 'products' ? 'Products' : 'Packages'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(orderType === 'products' ? products : packages).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <Button onClick={() => addItem(item)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total: ${getTotalAmount().toFixed(2)}</span>
              <Button onClick={handleCreateOrder} className="bg-primary hover:bg-primary-hover">
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateOrder;