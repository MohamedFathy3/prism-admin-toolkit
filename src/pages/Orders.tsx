"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, User, Calendar, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // تأكد من المسار الصحيح

interface Pack {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

interface OrderData {
  pack_id: number;
  order_status: string;
  delivery_status: string;
  note: string;
  shipping_date: string;
  contact_method: string;
  customer_id: number;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  order?: {
    id: number;
    order_number: string;
    total: number;
  };
}

const CreateOrder = () => {
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const customerIdFromUrl = Number(params.customerId);
 const { user } = useAuth()
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  // Order details
  const [orderStatus, setOrderStatus] = useState("processing");
  const [deliveryStatus, setDeliveryStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [contactMethod, setContactMethod] = useState("phone");

  // Set default shipping date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setShippingDate(tomorrow.toISOString().slice(0, 16).replace('T', ' '));
  }, []);

  // Fetch customer details
  const fetchCustomer = async (id: number) => {
    setCustomerLoading(true);
    try {
      const res = await apiFetch(`/customer/${id}`, {
        method: "GET",
      });
      
      console.log("Customer API response:", res);
      
      if (res.data) {
        setCustomer(res.data);
      } else {
        setCustomer({
          id: id,
          name: `Customer ${id}`,
          phone: "Not available",
          address: "Not available"
        });
        toast({
          title: "Info",
          description: "Using default customer information",
        });
      }
    } catch (err) {
      console.error("Error fetching customer:", err);
      setCustomer({
        id: id,
        name: `Customer ${id}`,
        phone: "Not available",
        address: "Not available"
      });
      toast({
        title: "Warning",
        description: "Using default customer information",
        variant: "default",
      });
    } finally {
      setCustomerLoading(false);
    }
  };

  // Fetch packs
  const fetchPacks = async () => {
    try {
      const res = await apiFetch("/pack/index", {
        method: "POST",
        data: {
          filters: {},
          orderBy: "id",
          orderByDirection: "desc",
          perPage: 20,
          paginate: false,
          deleted: false,
        },
      });

      const packsData = res?.data?.data || res?.data || [];
      
      const formattedPacks = (Array.isArray(packsData) ? packsData : []).map(pack => ({
        ...pack,
        price: Number(pack.price) || 0
      }));
      
      setPacks(formattedPacks);
    } catch (err) {
      console.error("Error fetching packs:", err);
      toast({
        title: "Error",
        description: "Failed to load packs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (customerIdFromUrl && !isNaN(customerIdFromUrl)) {
      fetchCustomer(customerIdFromUrl);
    } else {
      setCustomerLoading(false);
      toast({
        title: "Error",
        description: "Invalid customer ID",
        variant: "destructive",
      });
    }
    fetchPacks();
  }, [customerIdFromUrl]);

  // Handle pack selection
  const handleSelectPack = (pack: Pack) => {
    setSelectedPack(pack);
    setApiResponse(null); // Clear previous response when selecting new pack
  };

  // Create Order
  const handleCreateOrder = async () => {
    if (!selectedPack) {
      toast({
        title: "Error",
        description: "Please select a pack first",
        variant: "destructive",
      });
      return;
    }

    if (!customerIdFromUrl || isNaN(customerIdFromUrl)) {
      toast({
        title: "Error",
        description: "Invalid customer selection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setApiResponse(null);

    try {
      const orderData: OrderData = {
        pack_id: selectedPack.id,
        order_status: orderStatus,
        delivery_status: deliveryStatus,
        note: note,
        shipping_date: shippingDate ? shippingDate.replace('T', ' ') + ":00" : "",
        contact_method: contactMethod,
        customer_id: customerIdFromUrl
      };

      console.log("Sending order data:", orderData);

      const res = await apiFetch("/order", {
        method: "POST",
        data: orderData,
        headers: { "Content-Type": "application/json" },
      });

      setApiResponse({
        success: true,
        data: res.data,
        message: "Order created successfully",
        order: res.data?.order || res.data
      });

      toast({
        title: "Success",
        description: "Order created successfully!",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedPack(null);
        setNote("");
        setApiResponse(null);
      }, 3000);
      
    } catch (err: any) {
      console.error("❌ Error creating order:", err);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: err.response?.data?.message || "Failed to create order",
        data: err.response?.data
      };
      
      setApiResponse(errorResponse);
      
      toast({
        title: "Error",
        description: errorResponse.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price: any) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create New Order
              </h1>
              <p className="text-muted-foreground">Create order for selected customer</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Total: ${selectedPack ? formatPrice(selectedPack.price) : "0.00"}
          </Badge>
        </div>

        {/* Customer Info */}
        {customerLoading ? (
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-6">
              <div className="animate-pulse flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ) : customer ? (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                      {customer.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {customer.address}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-blue-600 dark:bg-blue-700 px-3 py-1">
                  Customer ID: {customer.id}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pack Selection Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Pack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                  {packs.map((pack) => (
                    <div
                      key={pack.id}
                      className={`border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPack?.id === pack.id
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/30 hover:bg-accent/30"
                      }`}
                      onClick={() => handleSelectPack(pack)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={pack.image || "/placeholder-image.jpg"}
                          alt={pack.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21,15 16,10 5,21'/%3E%3C/svg%3E";
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{pack.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>${formatPrice(pack.price)}</span>
                            <span>Stock: {pack.stock}</span>
                          </div>
                        </div>
                     
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Section */}
          <div className="space-y-4">
            {selectedPack ? (
              <>
              <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Calendar className="h-5 w-5" />
      Order Details
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Employee & Customer Info */}
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Employee Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Employee
        </h4>
        <div className="space-y-1 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            <strong>Name:</strong> {user?.user_name || "N/A"}
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            <strong>Role:</strong> {user?.role || "N/A"}
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            <strong>phone:</strong> {user?.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Customer
        </h4>
        <div className="space-y-1 text-sm">
          <p className="text-green-700 dark:text-green-300">
            <strong>Name:</strong> {customer?.name || "N/A"}
          </p>
          <p className="text-green-700 dark:text-green-300">
            <strong>Phone:</strong> {customer?.phone || "N/A"}
          </p>
          <p className="text-green-700 dark:text-green-300">
            <strong>Address:</strong> {customer?.address || "N/A"}
          </p>
        </div>
      </div>
    </div>

    {/* Selected Pack Info */}
    <div className="bg-accent/30 p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Selected Pack</h4>
      <div className="flex items-center gap-3">
        <img
          src={selectedPack.image || "/placeholder-image.jpg"}
          alt={selectedPack.name}
          className="w-12 h-12 object-cover rounded"
        />
        <div>
          <p className="font-medium">{selectedPack.name}</p>
          <p className="text-primary font-bold">${formatPrice(selectedPack.price)}</p>
        </div>
      </div>
    </div>

    {/* Order Form */}
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="orderStatus">Order Status</Label>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryStatus">Delivery Status</Label>
          <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactMethod">Contact Method</Label>
        <Select value={contactMethod} onValueChange={setContactMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="store">Store</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingDate">Shipping Date & Time</Label>
        <Input
          type="datetime-local"
          value={shippingDate.replace(' ', 'T')}
          onChange={(e) => setShippingDate(e.target.value.replace('T', ' '))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Notes</Label>
        <Textarea
          placeholder="Add any special instructions or notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>
    </div>

    {/* Submit Button */}
    <Button 
      onClick={handleCreateOrder} 
      disabled={loading}
      className="w-full h-12 text-lg"
      size="lg"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          Creating Order...
        </span>
      ) : (
        `Create Order - $${formatPrice(selectedPack.price)}`
      )}
    </Button>
  </CardContent>
</Card>

                {/* API Response Display */}
                {apiResponse && (
                  <Card className={apiResponse.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${apiResponse.success ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                          {apiResponse.success ? (
                            <span className="text-green-600 dark:text-green-400">✓</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗</span>
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${apiResponse.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                            {apiResponse.success ? 'Order Created Successfully' : 'Order Failed'}
                          </h4>
                          <p className={`text-sm ${apiResponse.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {apiResponse.message}
                          </p>
                          {apiResponse.order && (
                            <div className="text-xs mt-1 space-y-1">
                              <p>Order ID: {apiResponse.order.id}</p>
                              {apiResponse.order.order_number && <p>Order #: {apiResponse.order.order_number}</p>}
                              {apiResponse.order.total && <p>Total: ${formatPrice(apiResponse.order.total)}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-3">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No Pack Selected</h3>
                    <p className="text-sm text-muted-foreground">Please select a pack from the list to create an order</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;