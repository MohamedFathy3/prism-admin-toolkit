import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CostItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface CostProject {
  id: string;
  name: string;
  description: string;
  items: CostItem[];
  laborCost: number;
  overheadPercentage: number;
  profitMargin: number;
  finalQuote: number;
  createdDate: string;
}

const Costing = () => {
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<CostProject[]>([
    {
      id: '1',
      name: 'Website Development Project',
      description: 'Complete website development with e-commerce functionality',
      items: [
        { id: '1', description: 'Design Hours', quantity: 40, unitCost: 75, totalCost: 3000 },
        { id: '2', description: 'Development Hours', quantity: 80, unitCost: 100, totalCost: 8000 }
      ],
      laborCost: 2500,
      overheadPercentage: 15,
      profitMargin: 20,
      finalQuote: 16675,
      createdDate: '2024-01-15'
    }
  ]);

  const [currentProject, setCurrentProject] = useState({
    name: '',
    description: '',
    laborCost: '',
    overheadPercentage: '',
    profitMargin: ''
  });

  const [currentItems, setCurrentItems] = useState<CostItem[]>([]);
  
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '',
    unitCost: ''
  });

  const addItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitCost) {
      toast({
        title: "Error",
        description: "Please fill in all item fields",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(newItem.quantity);
    const unitCost = parseFloat(newItem.unitCost);
    const totalCost = quantity * unitCost;

    const item: CostItem = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity,
      unitCost,
      totalCost
    };

    setCurrentItems([...currentItems, item]);
    setNewItem({ description: '', quantity: '', unitCost: '' });

    toast({
      title: "Success",
      description: "Item added to project"
    });
  };

  const removeItem = (id: string) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setCurrentItems(currentItems.map(item => 
      item.id === id 
        ? { ...item, quantity, totalCost: quantity * item.unitCost }
        : item
    ));
  };

  const updateItemUnitCost = (id: string, unitCost: number) => {
    setCurrentItems(currentItems.map(item => 
      item.id === id 
        ? { ...item, unitCost, totalCost: item.quantity * unitCost }
        : item
    ));
  };

  const getMaterialsCost = () => {
    return currentItems.reduce((total, item) => total + item.totalCost, 0);
  };

  const calculateFinalQuote = () => {
    const materialsCost = getMaterialsCost();
    const laborCost = parseFloat(currentProject.laborCost) || 0;
    const subtotal = materialsCost + laborCost;
    const overheadCost = subtotal * ((parseFloat(currentProject.overheadPercentage) || 0) / 100);
    const costWithOverhead = subtotal + overheadCost;
    const profitAmount = costWithOverhead * ((parseFloat(currentProject.profitMargin) || 0) / 100);
    return costWithOverhead + profitAmount;
  };

  const saveProject = () => {
    if (!currentProject.name || currentItems.length === 0) {
      toast({
        title: "Error",
        description: "Please provide project name and add at least one item",
        variant: "destructive"
      });
      return;
    }

    const project: CostProject = {
      id: Date.now().toString(),
      name: currentProject.name,
      description: currentProject.description,
      items: [...currentItems],
      laborCost: parseFloat(currentProject.laborCost) || 0,
      overheadPercentage: parseFloat(currentProject.overheadPercentage) || 0,
      profitMargin: parseFloat(currentProject.profitMargin) || 0,
      finalQuote: calculateFinalQuote(),
      createdDate: new Date().toISOString().split('T')[0]
    };

    setProjects([...projects, project]);
    
    // Reset form
    setCurrentProject({
      name: '',
      description: '',
      laborCost: '',
      overheadPercentage: '',
      profitMargin: ''
    });
    setCurrentItems([]);

    toast({
      title: "Success",
      description: "Cost estimate saved successfully!"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Estimation</h1>
        <p className="text-muted-foreground">Create detailed cost estimates and project quotes</p>
      </div>

      {/* New Project Form */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            New Cost Estimate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labor-cost">Labor Cost ($)</Label>
              <Input
                id="labor-cost"
                type="number"
                step="0.01"
                value={currentProject.laborCost}
                onChange={(e) => setCurrentProject({ ...currentProject, laborCost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              value={currentProject.description}
              onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
              placeholder="Brief project description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overhead">Overhead (%)</Label>
              <Input
                id="overhead"
                type="number"
                step="0.1"
                value={currentProject.overheadPercentage}
                onChange={(e) => setCurrentProject({ ...currentProject, overheadPercentage: e.target.value })}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profit-margin">Profit Margin (%)</Label>
              <Input
                id="profit-margin"
                type="number"
                step="0.1"
                value={currentProject.profitMargin}
                onChange={(e) => setCurrentProject({ ...currentProject, profitMargin: e.target.value })}
                placeholder="20"
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Cost Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Item description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Unit cost"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({ ...newItem, unitCost: e.target.value })}
              />
              <Button onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Items Table */}
            {currentItems.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateItemUnitCost(item.id, parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
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
                <span>Materials Cost:</span>
                <span>${getMaterialsCost().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Cost:</span>
                <span>${(parseFloat(currentProject.laborCost) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead ({currentProject.overheadPercentage || 0}%):</span>
                <span>${(((getMaterialsCost() + (parseFloat(currentProject.laborCost) || 0)) * ((parseFloat(currentProject.overheadPercentage) || 0) / 100))).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin ({currentProject.profitMargin || 0}%):</span>
                <span>${((calculateFinalQuote() - (getMaterialsCost() + (parseFloat(currentProject.laborCost) || 0) + ((getMaterialsCost() + (parseFloat(currentProject.laborCost) || 0)) * ((parseFloat(currentProject.overheadPercentage) || 0) / 100))))).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Final Quote:</span>
                <span className="text-primary">${calculateFinalQuote().toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button onClick={saveProject} className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Save Cost Estimate
          </Button>
        </CardContent>
      </Card>

      {/* Saved Projects */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle>Saved Cost Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-muted-foreground">{project.description}</p>
                    <p className="text-sm text-muted-foreground">Created: {project.createdDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${project.finalQuote.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Final Quote</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {project.items.length} items • Labor: ${project.laborCost.toFixed(2)} • 
                  Overhead: {project.overheadPercentage}% • Profit: {project.profitMargin}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Costing;