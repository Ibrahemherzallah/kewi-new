// src/pages/admin/AdminProducts.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Package, ArrowLeft } from "lucide-react";
import { AddProductDialog } from "@/components/admin/AddProductDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditProductDialog } from "@/components/admin/EditProductDialog";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PRODUCTS_API = `${API_BASE}/admin/products`;

type Product = {
  _id: string;
  name: string;
  description?: string;
  id?: string;              // your internal ID field
  image?: string[];         // array of image URLs
  categoryId?: any;
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
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      toast({
        title: "Deleted",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    return (
        product.name.toLowerCase().includes(q) ||
        (product.id && product.id.toLowerCase().includes(q)) ||
        (product.color && product.color.toLowerCase().includes(q))
    );
  });

  return (
      <div className="min-h-screen bg-background">
        <Navbar />

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
            <AddProductDialog onProductCreated={fetchProducts} />
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Search by name, ID, or color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
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
                      <TableHead>Gender</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Customer Price</TableHead>
                      <TableHead>Wholesaler Price</TableHead>
                      <TableHead>Sale Price</TableHead>
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
                          <TableCell
                              colSpan={11}
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
                onUpdated={fetchProducts}
            />
        )}
      </div>
  );
};

export default AdminProducts;
