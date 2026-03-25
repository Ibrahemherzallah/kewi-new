// src/pages/admin/AdminBrands.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Tag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddBrandDialog } from "@/components/admin/AddBrandDialog";
import { EditBrandDialog, Brand } from "@/components/admin/EditBrandDialog";
import { useToast } from "@/hooks/use-toast";
const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const BRANDS_API = `${API_BASE}/admin/api/brands`;

const AdminBrands = () => {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const token = localStorage.getItem("token");

  const { toast } = useToast();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(BRANDS_API);
      if (!res.ok) throw new Error("Failed to fetch brands");

      const data: Brand[] = await res.json();
      setBrands(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error loading brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const res = await fetch(`${BRANDS_API}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete brand");
      }

      toast({
        title: "Deleted",
        description: "Brand deleted successfully",
      });

      fetchBrands();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Error deleting brand",
        variant: "destructive",
      });
    }
  };

  const filteredBrands = brands.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Brands</h1>
                <p className="text-muted-foreground">Manage product brands</p>
              </div>
            </div>
            <AddBrandDialog onBrandCreated={fetchBrands} />
          </div>

          <Card className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search brands..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
              </div>
            </div>

            {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            {loading ? (
                <p className="text-sm text-muted-foreground">Loading brands...</p>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.map((brand, index) => (
                        <TableRow key={brand._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {brand.image ? (
                                  <img
                                      src={brand.image}
                                      alt={brand.name}
                                      className="h-8 w-8 rounded-full object-cover border"
                                  />
                              ) : (
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                              )}
                              {brand.name}
                            </div>
                          </TableCell>
                          <TableCell>{brand.numOfClicks ?? 0}</TableCell>
                          <TableCell>
                      <span
                          className={`px-2 py-1 rounded-full text-xs ${
                              brand.isFake
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                          }`}
                      >
                        {brand.isFake ? "Fake" : "Real"}
                      </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBrand(brand);
                                    setEditOpen(true);
                                  }}
                              >
                                Edit
                              </Button>
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(brand._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}

                    {filteredBrands.length === 0 && !loading && (
                        <TableRow>
                          <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground py-6"
                          >
                            No brands found
                          </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
            )}
          </Card>
        </div>

        {/* Edit dialog */}
        {selectedBrand && (
            <EditBrandDialog
                open={editOpen}
                onOpenChange={(open) => {
                  setEditOpen(open);
                  if (!open) {
                    // optional: clear selected brand when closing
                    setSelectedBrand(null);
                  }
                }}
                brand={selectedBrand}
                onUpdated={fetchBrands}
            />
        )}
      </div>
  );
};

export default AdminBrands;
