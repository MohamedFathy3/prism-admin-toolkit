import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaleItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Sale {
  id: string;
  product: string;
  description: string;
  items: SaleItem[];
  laborCost: number;
  overheadPercentage: number;
  profitMargin: number;
  commissionPercentage: number;
  finalQuote: number;
  commission: number;
  netProfit: number;
  createdDate: string;
}

const SalesSystem = () => {
  const { toast } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState({
    product: "",
    description: "",
    laborCost: "",
    overheadPercentage: "",
    profitMargin: "",
    commissionPercentage: "",
  });

  const [currentItems, setCurrentItems] = useState<SaleItem[]>([]);
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: "",
    unitCost: "",
  });

  // 🟢 Load saved sales from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("salesData");
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();

      // Check expiry (24h = 86400000 ms)
      if (now - parsed.timestamp < 86400000) {
        setSales(parsed.data);
      } else {
        localStorage.removeItem("salesData");
      }
    }
  }, []);

  // 🟢 Save sales to localStorage
  const saveToLocalStorage = (data: Sale[]) => {
    localStorage.setItem(
      "salesData",
      JSON.stringify({ data, timestamp: Date.now() })
    );
  };

  const addItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitCost) {
      toast({
        title: "Error",
        description: "Please fill in all item fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(newItem.quantity);
    const unitCost = parseFloat(newItem.unitCost);
    const totalCost = quantity * unitCost;

    const item: SaleItem = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity,
      unitCost,
      totalCost,
    };

    setCurrentItems([...currentItems, item]);
    setNewItem({ description: "", quantity: "", unitCost: "" });
  };

  const removeItem = (id: string) => {
    setCurrentItems(currentItems.filter((item) => item.id !== id));
  };

  const getMaterialsCost = () => {
    return currentItems.reduce((total, item) => total + item.totalCost, 0);
  };

  const calculateFinalQuote = () => {
    const materialsCost = getMaterialsCost();
    const laborCost = parseFloat(currentSale.laborCost) || 0;
    const subtotal = materialsCost + laborCost;
    const overheadCost =
      subtotal * ((parseFloat(currentSale.overheadPercentage) || 0) / 100);
    const costWithOverhead = subtotal + overheadCost;
    const profitAmount =
      costWithOverhead *
      ((parseFloat(currentSale.profitMargin) || 0) / 100);
    return costWithOverhead + profitAmount;
  };

  const saveSale = () => {
    if (!currentSale.product || currentItems.length === 0) {
      toast({
        title: "Error",
        description: "Please provide product name and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const finalQuote = calculateFinalQuote();
    const commissionPercentage =
      parseFloat(currentSale.commissionPercentage) || 0;
    const commission = finalQuote * (commissionPercentage / 100);
    const netProfit = finalQuote - commission;

    const sale: Sale = {
      id: Date.now().toString(),
      product: currentSale.product,
      description: currentSale.description,
      items: [...currentItems],
      laborCost: parseFloat(currentSale.laborCost) || 0,
      overheadPercentage: parseFloat(currentSale.overheadPercentage) || 0,
      profitMargin: parseFloat(currentSale.profitMargin) || 0,
      commissionPercentage,
      finalQuote,
      commission,
      netProfit,
      createdDate: new Date().toISOString().split("T")[0],
    };

    const updatedSales = [...sales, sale];
    setSales(updatedSales);
    saveToLocalStorage(updatedSales);

    // Reset form
    setCurrentSale({
      product: "",
      description: "",
      laborCost: "",
      overheadPercentage: "",
      profitMargin: "",
      commissionPercentage: "",
    });
    setCurrentItems([]);

    toast({
      title: "Success",
      description: "Sale saved successfully!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales System</h1>
        <p className="text-muted-foreground">
          Calculate product cost, profit margin, commission and net profit
        </p>
      </div>

      {/* New Sale Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            New Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Product *</Label>
              <Input
                value={currentSale.product}
                onChange={(e) =>
                  setCurrentSale({ ...currentSale, product: e.target.value })
                }
                placeholder="Product name"
              />
            </div>
            <div>
              <Label>Labor Cost</Label>
              <Input
                type="number"
                value={currentSale.laborCost}
                onChange={(e) =>
                  setCurrentSale({ ...currentSale, laborCost: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Overhead %</Label>
              <Input
                type="number"
                value={currentSale.overheadPercentage}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    overheadPercentage: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Profit Margin %</Label>
              <Input
                type="number"
                value={currentSale.profitMargin}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    profitMargin: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Commission %</Label>
              <Input
                type="number"
                value={currentSale.commissionPercentage}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    commissionPercentage: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Unit cost"
                value={newItem.unitCost}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitCost: e.target.value })
                }
              />
              <Button onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {currentItems.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitCost}</TableCell>
                      <TableCell>${item.totalCost.toFixed(2)}</TableCell>
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
            )}
          </div>

          {/* Cost Summary */}
          {currentItems.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Materials:</span>
                <span>${getMaterialsCost().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor:</span>
                <span>${(parseFloat(currentSale.laborCost) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead:</span>
                <span>
                  $
                  {(
                    ((getMaterialsCost() +
                      (parseFloat(currentSale.laborCost) || 0)) *
                      ((parseFloat(currentSale.overheadPercentage) || 0) / 100))
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profit:</span>
                <span>
                  $
                  {(
                    calculateFinalQuote() -
                    (getMaterialsCost() +
                      (parseFloat(currentSale.laborCost) || 0) +
                      ((getMaterialsCost() +
                        (parseFloat(currentSale.laborCost) || 0)) *
                        ((parseFloat(currentSale.overheadPercentage) || 0) /
                          100)))
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Final Quote:</span>
                <span className="text-primary">
                  ${calculateFinalQuote().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Commission ({currentSale.commissionPercentage || 0}%):</span>
                <span className="text-red-500">
                  $
                  {(
                    calculateFinalQuote() *
                    ((parseFloat(currentSale.commissionPercentage) || 0) / 100)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Profit:</span>
                <span className="text-green-600">
                  $
                  {(
                    calculateFinalQuote() -
                    calculateFinalQuote() *
                      ((parseFloat(currentSale.commissionPercentage) || 0) /
                        100)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button onClick={saveSale} className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Save Sale
          </Button>
        </CardContent>
      </Card>

      {/* Saved Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{sale.product}</h3>
                    <p className="text-muted-foreground">{sale.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {sale.createdDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${sale.finalQuote.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Final Quote</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Items: {sale.items.length} • Labor: ${sale.laborCost} •
                  Overhead: {sale.overheadPercentage}% • Profit:{" "}
                  {sale.profitMargin}% • Commission: {sale.commissionPercentage}%
                </div>
                <div className="text-sm">
                  <p>Commission: ${sale.commission.toFixed(2)}</p>
                  <p className="font-bold">
                    Net Profit: ${sale.netProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSystem;
