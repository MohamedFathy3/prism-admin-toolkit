import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/type/type";
import { apiFetch } from "@/api/api";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [detailsEmployee, setDetailsEmployee] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  // Fetch employees with pagination
  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch("/user/index", {
        method: "POST",
        data: {
          filters: { role: "employee" },
          orderBy: "id",
          orderByDirection: "asc",
          perPage,
          page,
          paginate: true,
          deleted: false,
        },
      });
      
      console.log("Employees API response:", res);
      
      // محاولة قراءة البيانات من أماكن مختلفة في الـ response
      const employeesData = res?.data?.data || res?.data || [];
      const total = res?.data?.meta?.total || res?.total || 0;

      if (Array.isArray(employeesData)) {
        setEmployees(employeesData);
        setTotalPages(Math.ceil(total / perPage));
      } else {
        setEmployees([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({ title: "Error", description: "Failed to load employees", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage]);

  // Open modals - تم التصحيح هنا
  const openEditModal = (employee: User | null = null) => {
    if (employee) {
      // تعديل موظف موجود
      setEditEmployee({ ...employee });
    } else {
      // إضافة موظف جديد - إنشاء كائن جديد
      setEditEmployee({
        id: 0,
        user_name: "",
        phone: "",
        commission: "",
        password: "",
        active: 1,
        role: "employee"
      });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditEmployee(null);
  };

  const openDetailsModal = (employee: User) => {
    setDetailsEmployee(employee);
    setIsDetailsOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsEmployee(null);
    setIsDetailsOpen(false);
  };

  // Handle input changes - تم التصحيح هنا
  const handleInputChange = (field: keyof User, value: string) => {
    setEditEmployee(prev => {
      if (!prev) {
        // إذا كان null، إنشاء كائن جديد
        return {
          id: 0,
          user_name: "",
          phone: "",
          commission: "",
          password: "",
          active: 1,
          role: "employee",
          [field]: value
        } as User;
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Add or update employee
  const handleSave = async () => {
    if (!editEmployee) return;

    // التحقق من الحقول المطلوبة
    if (!editEmployee.user_name || !editEmployee.phone) {
      toast({ 
        title: "Error", 
        description: "Username and phone are required", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (editEmployee.id) {
        // تحديث موظف موجود
        console.log("Updating employee:", editEmployee);
        await apiFetch(`/user/update/${editEmployee.id}`, { 
          method: "PUT", 
          data: { 
            user_name: editEmployee.user_name,
            phone: editEmployee.phone,
            commission: editEmployee.commission || "",
            password: editEmployee.password || "",
            role: "employee"
          } 
        });
        toast({ title: "Success", description: "Employee updated successfully" });
      } else {
        // إضافة موظف جديد
        console.log("Adding new employee:", editEmployee);
        await apiFetch("/user", { 
          method: "POST", 
          data: { 
            user_name: editEmployee.user_name,
            phone: editEmployee.phone,
            commission: editEmployee.commission || "",
            password: editEmployee.password || "",
            role: "employee"
          } 
        });
        toast({ title: "Success", description: "Employee added successfully" });
      }
      fetchEmployees(currentPage);
      closeModal();
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to save employee", 
        variant: "destructive" 
      });
    }
  };

  // Toggle active
  const toggleActive = async (id: number, active: boolean) => {
    try {
      await apiFetch(`/user/${id}/active`, { 
        method: "PUT", 
        data: { active: active ? 1 : 0 } 
      });
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, active: active ? 1 : 0 } : e))
      );
      toast({ 
        title: "Success", 
        description: `Employee ${active ? "activated" : "deactivated"}` 
      });
    } catch (err: any) {
      console.error("Toggle active error:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to update status", 
        variant: "destructive" 
      });
    }
  };

  // Delete employee
  const deleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {


      
      await apiFetch(`/user/delete`, { method: "DELETE"
, data: { items: [id] }
       });
      toast({ title: "Deleted", description: "Employee removed successfully" });
      fetchEmployees(currentPage);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to delete employee", 
        variant: "destructive" 
      });
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button onClick={() => openEditModal(null)} variant="default">
          <Plus className="h-4 w-4 mr-1" /> Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.user_name}</TableCell>
                  <TableCell>{emp.phone || "N/A"}</TableCell>
                  <TableCell>{emp.commission || "0"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!emp.active}
                        onChange={(val) => toggleActive(emp.id!, val)}
                        className={`${!!emp.active ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span className={`${!!emp.active ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                      </Switch>
                      <Badge variant={emp.active ? "default" : "secondary"}>
                        {emp.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate(`/employee/${emp.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                     
                      <Button size="sm" variant="destructive" onClick={() => deleteEmployee(emp.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <Button 
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {editEmployee?.id ? "Edit Employee" : "Add New Employee"}
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Username *</label>
                      <Input
                        placeholder="Enter username"
                        value={editEmployee?.user_name || ""}
                        onChange={(e) => handleInputChange('user_name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone *</label>
                      <Input
                        placeholder="Enter phone number"
                        value={editEmployee?.phone || ""}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Commission</label>
                      <Input
                        placeholder="Enter commission"
                        value={editEmployee?.commission || ""}
                        onChange={(e) => handleInputChange('commission', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {editEmployee?.id ? "New Password (leave empty to keep current)" : "Password *"}
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={editEmployee?.password || ""}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editEmployee?.id ? "Update Employee" : "Add Employee"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Employees;