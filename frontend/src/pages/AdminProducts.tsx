// src/pages/admin/AdminProducts.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Package, ArrowLeft } from "lucide-react";
import { AddProductDialog } from "@/components/admin/AddProductDialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const PRODUCTS_API = `${API_BASE}/admin/api/products`;
const CATEGORIES_API = `${API_BASE}/admin/api/categories`;

type Category = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  name: string;
  description?: string;
  id?: string; // internal ID
  image?: string[];
  categoryId?: any; // can be string or populated object
  brandId?: any;
  stockNumber?: number;
  gender?: string;
  size?: string;
  color?: string;
  customerPrice?: number;
  wholesalerPrice?: number;
  salePrice?: number | null;
  isSoldOut?: boolean;
  isOnSale?: boolean;
  isSoon?: boolean;
  featured?: boolean;
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [prodRes, catRes] = await Promise.all([
        fetch(PRODUCTS_API),
        fetch(CATEGORIES_API),
      ]);

      if (!prodRes.ok) throw new Error("Failed to fetch products");

      const productsData: Product[] = await prodRes.json();
      setProducts(productsData);

      if (catRes.ok) {
        const categoriesData: Category[] = await catRes.json();
        setCategories(categoriesData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const toggleFeatured = async (product: Product) => {
    try {
      const res = await fetch(`${PRODUCTS_API}/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          featured: !product.featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      toast({
        title: "Updated",
        description: !product.featured
            ? "Product marked as featured"
            : "Product removed from featured",
      });

      fetchData();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      toast({
        title: "Deleted",
        description: "Product deleted successfully",
      });

      fetchData();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // helper to get category name from product.categoryId
  const getCategoryName = (product: Product): string => {
    if (!product.categoryId) return "—";

    // populated object case
    if (typeof product.categoryId === "object") {
      return product.categoryId.name || "—";
    }

    // string id case: look up in categories state
    const cat = categories.find((c) => c._id === product.categoryId);
    return cat?.name || "—";
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        (product.id && product.id.toLowerCase().includes(q)) ||
        (product._id && product._id.toLowerCase().includes(q)) ||
        (product.color && product.color.toLowerCase().includes(q)) ||
        getCategoryName(product).toLowerCase().includes(q);

    const matchesCategory =
        categoryFilter === "all"
            ? true
            : typeof product.categoryId === "object"
                ? product.categoryId?._id === categoryFilter
                : product.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Products Management</h1>
                <p className="text-muted-foreground">
                  Manage your product inventory
                </p>
              </div>
            </div>
            <AddProductDialog onProductCreated={fetchData} />
          </div>

          {/* Filters row: Search + Category filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Search by name, ID, color, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
          )}

          {/* Products Table */}
          <div className="bg-card rounded-lg border overflow-x-auto">
            {loading ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Loading products...
                </div>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Customer Price</TableHead>
                      <TableHead>Wholesaler Price</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Featured</TableHead>  {/* 👈 NEW */}
                      <TableHead>Flags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                        <TableRow key={product._id}>
                          {/* Image */}
                          <TableCell>
                            {product.image && product.image[0] ? (
                                <img
                                    src={product.image[0]}
                                    alt={product.name}
                                    className="h-12 w-12 object-cover rounded"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                            )}
                          </TableCell>

                          {/* Name */}
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>

                          {/* ID */}
                          <TableCell>
                            <Badge variant="outline">
                              {product.id || "—"}
                            </Badge>
                          </TableCell>

                          {/* Category */}
                          <TableCell>{getCategoryName(product)}</TableCell>

                          {/* Gender */}
                          <TableCell>{product.gender || "—"}</TableCell>

                          {/* Size */}
                          <TableCell>{product.size || "—"}</TableCell>

                          {/* Stock */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {product.stockNumber ?? 0}
                            </div>
                          </TableCell>

                          {/* Customer Price */}
                          <TableCell>
                            {product.customerPrice != null
                                ? `${product.customerPrice.toFixed(2)} ₪`
                                : "—"}
                          </TableCell>

                          {/* Wholesaler Price */}
                          <TableCell>
                            {product.wholesalerPrice != null
                                ? `${product.wholesalerPrice.toFixed(2)} ₪`
                                : "—"}
                          </TableCell>

                          {/* Sale Price */}
                          <TableCell>
                            {product.salePrice != null
                                ? `${product.salePrice.toFixed(2)} ₪`
                                : "—"}
                          </TableCell>

                          {/* Featured toggle 👇 */}
                          <TableCell>
                            <Button
                                variant={product.featured ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleFeatured(product)}
                            >
                              {product.featured ? "Yes" : "No"}
                            </Button>
                          </TableCell>

                          {/* Flags */}
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {product.isOnSale && (
                                  <Badge variant="secondary" className="text-xs">
                                    On Sale
                                  </Badge>
                              )}
                              {product.isSoldOut && (
                                  <Badge variant="destructive" className="text-xs">
                                    Sold Out
                                  </Badge>
                              )}
                              {product.isSoon && (
                                  <Badge variant="outline" className="text-xs">
                                    Coming Soon
                                  </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setEditOpen(true);
                                  }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(product._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}

                    {filteredProducts.length === 0 && !loading && (
                        <TableRow>
                          {/* we now have 13 columns total */}
                          <TableCell
                              colSpan={13}
                              className="text-center py-6 text-muted-foreground"
                          >
                            No products found
                          </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
            )}
          </div>
        </div>

        {/* Edit dialog */}
        {selectedProduct && (
            <EditProductDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                product={selectedProduct}
                onUpdated={fetchData}
            />
        )}
      </div>
  );
};

export default AdminProducts;
