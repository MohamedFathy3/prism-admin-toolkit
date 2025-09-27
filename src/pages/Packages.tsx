import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/api/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface PackProduct {
  id: number;
  quantity: number;
}

interface Pack {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  products: PackProduct[];
  status: "active" | "inactive";
}

const Packs = () => {
  const { toast } = useToast();

  // Packs
  const [packs, setPacks] = useState<Pack[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // New Pack
  const [newPack, setNewPack] = useState({ 
    name: "", 
    price: "", 
    stock: "", 
    image: null as File | null 
  });
  const [selectedProducts, setSelectedProducts] = useState<PackProduct[]>([]);

  // Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tempSelection, setTempSelection] = useState<PackProduct[]>([]);

  // Edit Pack
  const [editPack, setEditPack] = useState<Pack | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // --- Fetch Packs ---
  const fetchPacks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch("/pack/index", {
        method: "POST",
        data: {
          filters: {},
          orderBy: "id",
          orderByDirection: "desc",
          perPage: 5,
          paginate: true,
          deleted: false,
          page,
        },
      });

      console.log("Packs API response:", res);
      
      const packsData = res?.data?.data || res?.data || [];
      const lastPage = res?.data?.meta?.last_page || res?.meta?.last_page || 1;

      setPacks(Array.isArray(packsData) ? packsData : []);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("Error fetching packs:", err);
      toast({ 
        title: "Error", 
        description: "Failed to load packs", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks(currentPage);
  }, [currentPage]);

  // --- Fetch Products ---
  const fetchProducts = async () => {
    try {
      const res = await apiFetch("/product/index", {
        method: "POST",
        data: { 
          filters: {}, 
          perPage: 100, 
          page: 1,
          paginate: false 
        },
      });

      console.log("Products API response:", res);
      
      const productsData = res?.data?.data || res?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast({ 
        title: "Error", 
        description: "Failed to load products", 
        variant: "destructive" 
      });
    }
  };

  // --- Product Modal Handlers ---
  const openProductModal = (pack?: Pack) => {
    if (pack) {
      setTempSelection(pack.products.map(p => ({ ...p })));
    } else {
      setTempSelection([...selectedProducts]);
    }
    
    if (products.length === 0) {
      fetchProducts();
    }
    
    setProductModalOpen(true);
  };

  const confirmProductSelection = () => {
    if (editModalOpen && editPack) {
      setEditPack({ 
        ...editPack, 
        products: [...tempSelection] 
      });
    } else {
      setSelectedProducts([...tempSelection]);
    }
    setProductModalOpen(false);
  };

  const toggleTempProduct = (id: number) => {
    setTempSelection(prev => {
      const existing = prev.find(p => p.id === id);
      if (existing) {
        return prev.filter(p => p.id !== id);
      } else {
        return [...prev, { id, quantity: 1 }];
      }
    });
  };

  const setTempQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setTempSelection(prev => 
      prev.map(p => (p.id === id ? { ...p, quantity } : p))
    );
  };

  // --- رفع الصورة أولاً ثم إضافة الباك ---
  const [uploading, setUploading] = useState(false);

 const uploadImage = async (files: FileList) => {
    setUploading(true);
    try {
      console.log("🖼️ Starting image upload...", { fileCount: files.length });

      const uploadPromises = Array.from(files).map(async (file, index) => {
        console.log(`📤 Uploading file ${index + 1}:`, file.name);
        
        const formData = new FormData();
        formData.append("file", file);

        const res = await apiFetch("/media", { 
          method: "POST", 
          data: formData,
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log(`📥 Image upload response ${index + 1}:`, res);

        // البحث عن بيانات الصورة في أماكن مختلفة من الـ response
        let imageData = null;
        
        if (res.data?.data) {
          imageData = res.data.data;
        } else if (res.data) {
          imageData = res.data;
        }

        if (imageData && imageData.id) {
          console.log(`✅ Image uploaded successfully:`, imageData);
          return { 
            id: imageData.id, 
            previewUrl: imageData.previewUrl || imageData.fullUrl || imageData.url || URL.createObjectURL(file),
            fullUrl: imageData.fullUrl || imageData.url
          };
        } else {
          console.error(`❌ Image upload failed:`, res.data);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((img): img is UploadedImage => img !== null);

      console.log("✅ Successful uploads:", successfulUploads);
      setUploadedImages((prev) => [...prev, ...successfulUploads]);
      
      if (successfulUploads.length > 0) {
        toast({ 
          title: "Success", 
          description: `Uploaded ${successfulUploads.length} image(s)!` 
        });
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Upload failed", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };
  // --- Add Pack - الطريقة الصحيحة ---
  const handleAddPack = async () => {
    if (!newPack.name || !newPack.price || !newPack.stock) {
      toast({ 
        title: "Error", 
        description: "Please fill all required fields", 
        variant: "destructive" 
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({ 
        title: "Error", 
        description: "Please select at least one product", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      let imageId: number | null = null;

      // رفع الصورة أولاً إذا وجدت
      if (newPack.image instanceof File) {
        imageId = await uploadImage(newPack.image);
      }

      // إعداد بيانات الباك
      const packData: any = {
        name: newPack.name,
        price: parseFloat(newPack.price),
        stock: parseInt(newPack.stock),
        products: selectedProducts
      };

      // إضافة ID الصورة إذا تم رفعها
      if (imageId) {
        packData.image = imageId;
      }

      console.log("Sending pack data:", packData);

      // إرسال بيانات الباك
      const res = await apiFetch("/pack", {
        method: "POST", 
        data: packData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Add pack response:", res);

      if (res.data && res.data.success) {
        toast({ 
          title: "Success", 
          description: "Pack added successfully" 
        });
        
        // إعادة تعيين النموذج
        setNewPack({ name: "", price: "", stock: "", image: null });
        setSelectedProducts([]);
        fetchPacks(currentPage);
      } else {
        throw new Error(res.data?.message || "Failed to add pack");
      }
    } catch (err: any) {
      console.error("Error adding pack:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.products?.[0] || 
                          err.message || 
                          "Failed to add pack";
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Pack - الطريقة الصحيحة ---
  const handleEditPack = async () => {
    if (!editPack) return;

    if (!editPack.name || editPack.price <= 0 || editPack.stock < 0) {
      toast({ 
        title: "Error", 
        description: "Please fill all fields correctly", 
        variant: "destructive" 
      });
      return;
    }

    if (editPack.products.length === 0) {
      toast({ 
        title: "Error", 
        description: "Pack must have at least one product", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      let imageId: number | undefined;

      // رفع الصورة الجديدة إذا وجدت
      if (editPack.image instanceof File) {
        const uploadedImageId = await uploadImage(editPack.image);
        if (uploadedImageId) {
          imageId = uploadedImageId;
        }
      }

      // إعداد بيانات الباك للتحديث
      const packData: any = {
        name: editPack.name,
        price: editPack.price,
        stock: editPack.stock,
        products: editPack.products,
        _method: "PUT"
      };

      // إضافة ID الصورة الجديدة إذا تم رفعها
      if (imageId) {
        packData.image = imageId;
      }

      console.log("Sending edit pack data:", packData);

      // إرسال بيانات التحديث
      const res = await apiFetch(`/pack/update/${editPack.id}`, {
        method: "POST",
        data: packData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Edit pack response:", res);

      if (res.data && res.data.success) {
        toast({ 
          title: "Success", 
          description: "Pack updated successfully" 
        });
        setEditModalOpen(false);
        setEditPack(null);
        fetchPacks(currentPage);
      } else {
        throw new Error(res.data?.message || "Failed to update pack");
      }
    } catch (err: any) {
      console.error("Error updating pack:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.products?.[0] || 
                          err.message || 
                          "Failed to update pack";
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Pack ---
  const deletePack = async (id: number) => {
  if (!confirm("Are you sure?")) return;
  
  try {
    console.log("🚀 Sending payload to API:", { items: [id] });
    
    await apiFetch(`/pack/delete`, {
      method: "DELETE",
      data: { items: [id] }, // ← استخدم data بدل body
    });
    
    toast({ title: "Deleted", description: "pack deleted" });
    fetchPacks(currentPage);
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    toast({ 
      title: "Error", 
      description: err.response?.data?.message || "Delete failed", 
      variant: "destructive" 
    });
  }
  };

  // --- Pagination ---
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setNewPack({ name: "", price: "", stock: "", image: null });
    setSelectedProducts([]);
  };

  // فتح مودال التعديل
  const openEditModal = (pack: Pack) => {
    setEditPack({ 
      ...pack, 
      image: pack.image as any // الحفاظ على الصورة الحالية كـ string
    });
    setEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pack Management</h1>

      {/* Add Pack Form */}
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Add New Pack</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input 
            placeholder="Pack Name *" 
            value={newPack.name} 
            onChange={e => setNewPack({ ...newPack, name: e.target.value })} 
          />
          <Input 
            placeholder="Price *" 
            type="number" 
            step="0.01"
            min="0"
            value={newPack.price} 
            onChange={e => setNewPack({ ...newPack, price: e.target.value })} 
          />
          <Input 
            placeholder="Stock *" 
            type="number" 
            min="0"
            value={newPack.stock} 
            onChange={e => setNewPack({ ...newPack, stock: e.target.value })} 
          />
          <Input 
            type="file" 
            accept="image/*"
            onChange={e => setNewPack({ ...newPack, image: e.target.files?.[0] || null })} 
          />
        </div>

        <Button onClick={() => openProductModal()} className="mb-4">
          Select Products ({selectedProducts.length})
        </Button>

        {/* Selected Products Preview */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Selected Products:</h3>
            {selectedProducts.map(sp => {
              const product = products.find(p => p.id === sp.id);
              return product ? (
                <div key={sp.id} className="flex items-center justify-between border p-2 rounded">
                  <div className="flex items-center gap-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded" 
                    />
                    <span>{product.name} (${product.price})</span>
                  </div>
                  <Input 
                    type="number" 
                    className="w-20" 
                    value={sp.quantity} 
                    min={1} 
                    onChange={e => setSelectedProducts(prev => 
                      prev.map(p => p.id === sp.id ? 
                        { ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) } : p
                      )
                    )} 
                  />
                </div>
              ) : null;
            })}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button onClick={handleAddPack} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> 
            {loading ? "Adding..." : "Add Pack"}
          </Button>
        </div>
      </div>

      {/* Packs Table */}
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Packs List</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading packs...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No packs found
                    </TableCell>
                  </TableRow>
                ) : (
                  packs.map(pack => (
                    <TableRow key={pack.id}>
                      <TableCell className="font-medium">{pack.name}</TableCell>
                      <TableCell>${pack.price}</TableCell>
                      <TableCell>{pack.stock}</TableCell>
                      <TableCell>
                        {pack.products.map(p => {
                          const product = products.find(pr => pr.id === p.id);
                          return product ? (
                            <div key={p.id} className="text-sm">
                              {product.name} × {p.quantity}
                            </div>
                          ) : (
                            <div key={p.id} className="text-sm">Product #{p.id} × {p.quantity}</div>
                          );
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => openEditModal(pack)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deletePack(pack.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* باقي الكود (Modals) يبقى كما هو */}
      {/* Product Selection Modal */}
       {/* Product Selection Modal */}
      <Transition show={productModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setProductModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl bg-background p-6 rounded-lg">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Select Products for Pack
                  </Dialog.Title>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {products.map(product => {
                      const selected = tempSelection.find(p => p.id === product.id);
                      return (
                        <div 
                          key={product.id} 
                          className={`border p-3 rounded flex items-center justify-between ${
                            selected ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input 
                              type="checkbox" 
                              checked={!!selected}
                              onChange={() => toggleTempProduct(product.id)}
                              className="h-4 w-4"
                            />
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ${product.price} • Stock: {product.stock}
                              </div>
                            </div>
                          </div>
                          
                          {selected && (
                            <Input 
                              type="number"
                              className="w-20"
                              value={selected.quantity}
                              min={1}
                              onChange={e => setTempQuantity(product.id, parseInt(e.target.value) || 1)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      {tempSelection.length} product(s) selected
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setProductModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={confirmProductSelection}>
                        Confirm Selection
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Pack Modal */}
      <Transition show={editModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl bg-background p-6 rounded-lg">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Edit Pack
                  </Dialog.Title>
                  
                  {editPack && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          placeholder="Pack Name"
                          value={editPack.name}
                          onChange={e => setEditPack({ ...editPack, name: e.target.value })}
                        />
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={editPack.price}
                          onChange={e => setEditPack({ ...editPack, price: Number(e.target.value) })}
                        />
                        <Input 
                          type="number"
                          placeholder="Stock"
                          value={editPack.stock}
                          onChange={e => setEditPack({ ...editPack, stock: Number(e.target.value) })}
                        />
                      </div>
                      
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={e => setEditPack({ 
                          ...editPack, 
                          image: e.target.files?.[0] || editPack.image 
                        })}
                      />

                      <Button onClick={() => openProductModal(editPack)}>
                        Edit Products ({editPack.products.length})
                      </Button>

                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setEditModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditPack} disabled={loading}>
                          {loading ? "Updating..." : "Update Pack"}
                        </Button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Packs;