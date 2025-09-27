"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Package, Upload, Image as ImageIcon, Trash2, Edit, X,Info } from "lucide-react";
import { apiFetch } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
interface Product {
  id: number;
  name: string;
  barcode?: string;
  price: string;
  stock: number;
  image?: string;
  images?: { id: number; fullUrl: string; previewUrl: string }[];
}

interface UploadedImage {
  id: number;
  previewUrl: string;
  fullUrl?: string;
}

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: "",
  });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching products...", { page, searchTerm });
      
      const requestData = {
        filters: searchTerm ? { name: searchTerm, barcode: searchTerm } : {},
        orderBy: "id",
        orderByDirection: "desc",
        perPage: 10,
        paginate: true,
        deleted: false,
        page,
      };

      console.log("📤 Request data:", requestData);

      const res = await apiFetch("/product/index", {
        method: "POST",
        data: requestData,
      });

      console.log("📥 API Response:", res);

      let productData = [];
      if (Array.isArray(res.data?.data?.data)) {
        productData = res.data.data.data;
      } else if (Array.isArray(res.data?.data)) {
        productData = res.data.data;
      } else if (Array.isArray(res.data)) {
        productData = res.data;
      }

      const lastPage = res?.data?.data?.meta?.last_page || 
                       res?.data?.meta?.last_page || 
                       1;

      console.log("📊 Products data:", productData);
      setProducts(productData);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, toast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = async (files: FileList) => {
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

  const removeImage = (id: number) => {
    console.log("🗑️ Removing image:", id);
    setUploadedImages((p) => p.filter((i) => i.id !== id));
  };

  const handleEditProduct = (p: Product) => {
    console.log("✏️ Editing product:", p);
    setEditingProduct(p);
    setNewProduct({
      name: p.name,
      barcode: p.barcode || "",
      price: p.price,
      stock: String(p.stock),
    });
    
    let images: UploadedImage[] = [];
    if (p.images && p.images.length > 0) {
      images = p.images.map((i) => ({ 
        id: i.id, 
        previewUrl: i.previewUrl,
        fullUrl: i.fullUrl
      }));
    } else if (p.image) {
      images = [{ 
        id: 0,
        previewUrl: p.image,
        fullUrl: p.image
      }];
    }
    
    console.log("🖼️ Setting product images:", images);
    setUploadedImages(images);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("🚪 Closing modal");
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: "", barcode: "", price: "", stock: "" });
    setUploadedImages([]);
    setSaving(false);
  };

  // Save Product - الإصلاح الرئيسي هنا
const handleSaveProduct = async () => {
  if (!newProduct.name || !newProduct.price || !newProduct.stock) {
    toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
    return;
  }

  setSaving(true);
  
  try {
    // إعداد البيانات الأساسية
    const productData: any = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
    };

    // 🔥 الإصلاح: أرسل الباركود في الـ Add فقط، لا ترسله في الـ Update
    if (!editingProduct) {
      productData.barcode = newProduct.barcode || null;
      console.log("📦 Barcode being sent (ADD mode):", productData.barcode);
    } else {
      console.log("🚫 Barcode NOT sent (UPDATE mode - FK cannot be modified)");
    }

    // 🔥 الإصلاح 2: الصورة - التعامل الصحيح مع الصور الجديدة والحالية
// ✅ التعامل مع الصور في ADD / UPDATE
if (uploadedImages.length > 0) {
  const validImage = uploadedImages.find(img => img.id > 0);
  if (validImage) {
    productData.image = validImage.id; // ← صورة جديدة
    console.log("🖼️ Sending new image ID:", validImage.id);
  }
} else if (!editingProduct) {
  // في حالة الإضافة (ADD) بدون صورة
  productData.image = null;
}


    console.log("📤 Final product data to send:", productData);
    console.log("📤 Mode:", editingProduct ? "UPDATE" : "ADD");

    const url = editingProduct ? `/product/${editingProduct.id}` : "/product";
    const method = editingProduct ? "PATCH" : "POST";
    
    console.log(`🌐 Making ${method} request to: ${url}`);

    const res = await apiFetch(url, { 
      method, 
      data: productData,
      headers: { "Content-Type": "application/json" }
    });

    console.log("📥 Save response:", res);

    // التحقق من النجاح
    const isSuccess = res.data?.success || 
                     res.data?.id || 
                     res.status === 200 || 
                     res.status === 201 ||
                     res.data?.status === 'success';

    if (isSuccess) {
      console.log("✅ Product saved successfully");
      toast({
        title: "Success",
        description: editingProduct ? "Product updated!" : "Product added!",
      });
      
      await fetchProducts();
      setTimeout(() => handleCloseModal(), 100);
      
    } else if (res.data?.errors) {
      // معالجة أخطاء الباركود
      console.error("❌ Validation errors:", res.data.errors);
      
      if (res.data.errors.barcode) {
        throw new Error(`Barcode error: ${res.data.errors.barcode[0]}`);
      } else {
        const errorMessage = Object.values(res.data.errors).flat().join(', ');
        throw new Error(errorMessage);
      }
    } else {
      throw new Error(res.data?.message || "Operation failed");
    }
  } catch (err: any) {
    console.error("❌ Save error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });

    let errorMessage = "Failed to save product";
    
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (errors.barcode) {
        errorMessage = `Barcode error: ${errors.barcode[0]}`;
      } else {
        errorMessage = Object.values(errors).flat().join(', ');
      }
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    toast({ 
      title: "Error", 
      description: errorMessage, 
      variant: "destructive" 
    });
  } finally {
    setSaving(false);
  }
};

const handleDeleteProduct = async (id: number) => {
  if (!confirm("Are you sure?")) return;
  
  try {
    console.log("🚀 Sending payload to API:", { items: [id] });
    
    await apiFetch(`/product/delete`, {
      method: "DELETE",
      data: { items: [id] }, // ← استخدم data بدل body
    });
    
    toast({ title: "Deleted", description: "Product deleted" });
    fetchProducts();
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    toast({ 
      title: "Error", 
      description: err.response?.data?.message || "Delete failed", 
      variant: "destructive" 
    });
  }
};


  const renderProductImages = (p: Product) => {
    const imgs = p.images || (p.image ? [{ id: 0, previewUrl: p.image }] : []);
    if (!imgs.length) return <ImageIcon className="h-10 w-10 text-muted-foreground" />;
    return (
      <div className="flex gap-1">
        <div className="relative">
          <img 
            src={imgs[0].previewUrl} 
            alt={p.name}
            className="h-10 w-10 rounded object-cover border"
          />
          {imgs.length > 1 && (
            <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
              +{imgs.length - 1}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>



    <Dialog open={isModalOpen} onOpenChange={(open) => !open && !saving && handleCloseModal()}>
  <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}
        {editingProduct && (
          <Badge variant="outline" className="ml-2 text-xs">
            Barcode: {editingProduct.barcode || "N/A"}
          </Badge>
        )}
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Name *</label>
          <Input 
            placeholder="Product Name" 
            value={newProduct.name} 
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Barcode
            {editingProduct && (
              <Badge variant="secondary" className="text-xs">FK - Read Only</Badge>
            )}
          </label>
          
          {editingProduct ? (
            // في حالة التعديل - للعرض فقط
            <div className="flex flex-col gap-2">
              <Input 
                value={newProduct.barcode || "No barcode"} 
                disabled 
                className="bg-muted"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Barcode is a foreign key and cannot be modified</span>
              </div>
            </div>
          ) : (
            // في حالة الإضافة - تعديل عادي
            <>
              <Input 
                placeholder="Barcode (optional)" 
                value={newProduct.barcode} 
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })} 
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no barcode
              </p>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Price *</label>
          <Input 
            type="number" 
            step="0.01"
            placeholder="Price" 
            value={newProduct.price} 
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Stock *</label>
          <Input 
            type="number" 
            placeholder="Stock" 
            value={newProduct.stock} 
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Product Image</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            disabled={uploading || saving}
          />
          <div className={`flex flex-col items-center justify-center ${uploading ? "opacity-50" : ""}`}>
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm">{uploading ? "Uploading..." : "Click to upload image"}</p>
          </div>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Image:</label>
          <div className="grid grid-cols-3 gap-3">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img 
                  src={img.fullUrl} 
                  className="h-20 w-full object-cover rounded-lg border"
                />
                <button 
                  onClick={() => removeImage(img.id)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="text-xs text-center mt-1">ID: {img.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button 
        onClick={handleSaveProduct} 
        disabled={saving || uploading}
        className="w-full"
      >
        {saving ? "Saving..." : uploading ? "Uploading..." : editingProduct ? "Update Product" : "Add Product"}
      </Button>
    </div>
  </DialogContent>
</Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Product Inventory
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.barcode || <span className="text-muted-foreground">N/A</span>}</TableCell>
                      <TableCell>${p.price}</TableCell>
                      <TableCell>
                        <Badge variant={p.stock > 0 ? "default" : "destructive"}>
                          {p.stock} in stock
                        </Badge>
                      </TableCell>
                      <TableCell>{renderProductImages(p)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;