import { useState, useEffect } from "react";
import { apiFetch } from "@/api/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    city: "" 
  });

  const navigate = useNavigate();
  const perPage = 15;

  const fetchCustomers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await apiFetch("/customer/index", {
        method: "POST",
        data: {
          filters: search ? { name: search } : {},
          orderBy: "id",
          orderByDirection: "desc",
          perPage,
          paginate: true,
          deleted: false,
          page,
        },
      });
      setCustomers(res.data || []);
      setTotalPages(res.meta.last_page || 1);
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    try {
      // التحقق من الحقول المطلوبة
      if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
        alert("الرجاء إدخال اسم ورقم هاتف العميل");
        return;
      }

      // إرسال البيانات إلى API لإضافة العميل
      const response = await apiFetch("/customer", {
        method: "POST",
        data: newCustomer,
      });

      // التحقق من الاستجابة والتوجيه مباشرة
      if (response && response.id) {
        // التوجيه المباشر إلى صفحة إنشاء طلب مع معرف العميل الجديد
        navigate(`/orders/create/${response.id}`);
      } else if (response && response.data && response.data.id) {
        // إذا كان الـ id داخل response.data
        navigate(`/orders/create/${response.data.id}`);
      } else {
        console.error("لم يتم استقبال معرف العميل من الخادم");
        alert("تم إضافة العميل ولكن لم يتم العثور على المعرف");
      }

      // إغلاق المودال وإعادة تعيين الحقول
      setModalOpen(false);
      setNewCustomer({ name: "", phone: "", address: "", city: "" });
      
      // تحديث قائمة العملاء
      fetchCustomers(currentPage);

    } catch (err) {
      console.error("خطأ في إضافة العميل:", err);
      alert("حدث خطأ أثناء إضافة العميل");
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSelectCustomer = (customerId: number) => {
    navigate(`/orders/create/${customerId}`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
            <Input
              placeholder="Search for customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
          <Button
            variant="default"
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>add customer</span>
          </Button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      {/* Customers Table */}
      {!loading && (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {["ID", "name", "phone", "address", "city", "action"].map((th) => (
                  <th
                    key={th}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{customer.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{customer.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{customer.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{customer.address}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{customer.city}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => handleSelectCustomer(customer.id)}
                    >
                      إنشاء طلب
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md z-50 shadow-lg">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">إضافة عميل جديد</Dialog.Title>
          <div className="space-y-4">
            <Input
              placeholder="اسم العميل *"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
            <Input
              placeholder="رقم الهاتف *"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
            <Input
              placeholder="العنوان"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
            <Input
              placeholder="المدينة"
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
            />
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button onClick={createCustomer}>إضافة</Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default Customers;