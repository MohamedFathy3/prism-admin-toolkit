import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Archive, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductPackage {
  id: string;
  name: string;
  description: string;
  products: Product[];
  totalPrice: number;
  discountedPrice: number;
  status: 'active' | 'inactive';
}

const Packages = () => {
  const { toast } = useToast();
  
  // Mock products data
  const availableProducts: Product[] = [
    { id: '1', name: 'Wireless Headphones', price: 99.99 },
    { id: '2', name: 'Coffee Mug', price: 15.99 },
    { id: '3', name: 'Laptop Stand', price: 45.00 },
    { id: '4', name: 'Wireless Mouse', price: 35.99 },
    { id: '5', name: 'Keyboard', price: 79.99 },
  ];

  const [packages, setPackages] = useState<ProductPackage[]>([
    {
      id: '1',
      name: 'Office Bundle',
      description: 'Complete office setup package',
      products: [
        { id: '2', name: 'Coffee Mug', price: 15.99 },
        { id: '3', name: 'Laptop Stand', price: 45.00 }
      ],
      totalPrice: 60.98,
      discountedPrice: 55.00,
      status: 'active'
    },
    {
      id: '2',
      name: 'Tech Bundle',
      description: 'Essential tech accessories',
      products: [
        { id: '1', name: 'Wireless Headphones', price: 99.99 },
        { id: '4', name: 'Wireless Mouse', price: 35.99 }
      ],
      totalPrice: 135.98,
      discountedPrice: 120.00,
      status: 'active'
    }
  ]);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    discountedPrice: ''
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getSelectedProductsTotal = () => {
    return selectedProducts
      .map(id => availableProducts.find(p => p.id === id)?.price || 0)
      .reduce((sum, price) => sum + price, 0);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPackage.name || selectedProducts.length === 0 || !newPackage.discountedPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one product",
        variant: "destructive"
      });
      return;
    }

    const packageProducts = selectedProducts.map(id => 
      availableProducts.find(p => p.id === id)!
    );

    const totalPrice = getSelectedProductsTotal();
    const discountedPrice = parseFloat(newPackage.discountedPrice);

    if (discountedPrice >= totalPrice) {
      toast({
        title: "Error",
        description: "Discounted price must be less than the total price",
        variant: "destructive"
      });
      return;
    }

    const packageObj: ProductPackage = {
      id: Date.now().toString(),
      name: newPackage.name,
      description: newPackage.description,
      products: packageProducts,
      totalPrice,
      discountedPrice,
      status: 'active'
    };

    setPackages([...packages, packageObj]);
    setNewPackage({ name: '', description: '', discountedPrice: '' });
    setSelectedProducts([]);
    
    toast({
      title: "Success",
      description: "Package created successfully!"
    });
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSavingsPercentage = (totalPrice: number, discountedPrice: number) => {
    return Math.round(((totalPrice - discountedPrice) / totalPrice) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Package Management</h1>
        <p className="text-muted-foreground">Create and manage product packages with bundle discounts</p>
      </div>

      {/* Create Package Form */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePackage} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Package Name *</Label>
                <Input
                  id="package-name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  placeholder="Enter package name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discounted-price">Discounted Price *</Label>
                <Input
                  id="discounted-price"
                  type="number"
                  step="0.01"
                  value={newPackage.discountedPrice}
                  onChange={(e) => setNewPackage({ ...newPackage, discountedPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package-description">Description</Label>
              <Textarea
                id="package-description"
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                placeholder="Package description"
              />
            </div>

            <div className="space-y-4">
              <Label>Select Products for Package *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Selected Products Total: ${getSelectedProductsTotal().toFixed(2)}
                  </p>
                  {newPackage.discountedPrice && (
                    <p className="text-sm text-muted-foreground">
                      Savings: ${(getSelectedProductsTotal() - parseFloat(newPackage.discountedPrice || '0')).toFixed(2)} 
                      ({getSavingsPercentage(getSelectedProductsTotal(), parseFloat(newPackage.discountedPrice || '0'))}% off)
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Packages List */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Product Packages
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-muted-foreground">{pkg.description}</p>
                  </div>
                  <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                    {pkg.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Included Products:</h4>
                    <div className="space-y-1">
                      {pkg.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-sm">
                          <span>{product.name}</span>
                          <span>${product.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Regular Price:</span>
                      <span className="line-through">${pkg.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Package Price:</span>
                      <span className="text-primary">${pkg.discountedPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Savings:</span>
                      <span className="text-success">
                        {getSavingsPercentage(pkg.totalPrice, pkg.discountedPrice)}% off
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Packages;