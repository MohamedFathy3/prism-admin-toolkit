import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Download, Plus } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

const Invoices = () => {
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customerName: 'John Smith',
      orderNumber: 'ORD-001',
      amount: 299.97,
      status: 'paid',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      items: [
        { description: 'Wireless Headphones', quantity: 1, unitPrice: 99.99, total: 99.99 },
        { description: 'Coffee Mug', quantity: 2, unitPrice: 15.99, total: 31.98 },
        { description: 'Laptop Stand', quantity: 1, unitPrice: 45.00, total: 45.00 }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      customerName: 'Alice Johnson',
      orderNumber: 'ORD-002',
      amount: 99.99,
      status: 'sent',
      issueDate: '2024-01-16',
      dueDate: '2024-02-15',
      items: [
        { description: 'Wireless Headphones', quantity: 1, unitPrice: 99.99, total: 99.99 }
      ]
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Bob Brown',
      orderNumber: 'ORD-003',
      amount: 567.45,
      status: 'overdue',
      issueDate: '2024-01-10',
      dueDate: '2024-02-09',
      items: [
        { description: 'Tech Bundle Package', quantity: 1, unitPrice: 567.45, total: 567.45 }
      ]
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      customerName: 'Carol White',
      orderNumber: 'ORD-004',
      amount: 45.98,
      status: 'draft',
      issueDate: '2024-01-16',
      dueDate: '2024-02-15',
      items: [
        { description: 'Coffee Mug', quantity: 2, unitPrice: 15.99, total: 31.98 },
        { description: 'Shipping', quantity: 1, unitPrice: 14.00, total: 14.00 }
      ]
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      'draft': 'secondary' as const,
      'sent': 'default' as const,
      'paid': 'default' as const,
      'overdue': 'destructive' as const
    };

    const colors = {
      'draft': 'bg-gray-500 text-white',
      'sent': 'bg-blue-500 text-white',
      'paid': 'bg-green-500 text-white',
      'overdue': 'bg-red-500 text-white'
    };
    
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTotalRevenue = () => {
    return invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getPendingAmount = () => {
    return invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
        <p className="text-muted-foreground">Generate and track customer invoices</p>
      </div>

      {/* Invoice Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Paid)</p>
                <p className="text-2xl font-bold text-green-600">${getTotalRevenue().toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">${getPendingAmount().toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">${getOverdueAmount().toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoices List */}
        <Card className="lg:col-span-2 bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInvoice ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-muted-foreground">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">Order: {selectedInvoice.orderNumber}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Issue Date:</span>
                    <span className="text-sm">{selectedInvoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Due Date:</span>
                    <span className="text-sm">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-muted-foreground">{item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                        </div>
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  {selectedInvoice.status === 'draft' && (
                    <Button variant="outline" className="flex-1" size="sm">
                      Send Invoice
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an invoice to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;