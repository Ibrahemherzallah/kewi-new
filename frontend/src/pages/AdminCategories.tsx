import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, FolderTree } from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { AddCategoryDialog } from "@/components/admin/AddCategoryDialog";
import {EditCategoryDialog} from "@/components/admin/EditCategoryDialog.tsx";

// 🔹 adjust this to your actual API base / route
const CATEGORIES_API = import.meta.env.VITE_ENV
    ? `${import.meta.env.VITE_ENV}/admin/api/categories`
    : "https://kewi.ps/admin/api/categories";

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
  other: boolean;
  order: number;
  parentCategory?: string | null;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

const AdminCategories = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(CATEGORIES_API);
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data: Category[] = await res.json();
      console.log("The cat is :", data);
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا التصنيف؟")) return;
    const res = await fetch(`${CATEGORIES_API}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }, });
    if (res.ok) fetchCategories();
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= filteredCategories.length) return;

    const idA = filteredCategories[index]._id;
    const idB = filteredCategories[swapIndex]._id;

    await fetch(`${CATEGORIES_API}/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idA, idB }),
    });

    fetchCategories(); // refresh
  };

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Categories</h1>
                <p className="text-muted-foreground">
                  Organize product categories
                </p>
              </div>
            </div>

            {/* dialog will call fetchCategories after create */}
            <AddCategoryDialog onCategoryCreated={fetchCategories} />
          </div>

          <Card className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search categories..."
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
                <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Other</TableHead>
                      <TableHead>Parent Category</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCategories.map((category, index) => (
                        <TableRow key={category._id}>
                          <TableCell>{index + 1}</TableCell>

                          {/* ✅ show image (old URLs and new URLs both work) */}
                          <TableCell>
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-12 w-12 rounded-md object-cover border"
                                />
                            ) : (
                                <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                            )}
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FolderTree className="h-4 w-4 text-muted-foreground" />
                              {category.name}
                            </div>
                          </TableCell>

                          <TableCell className="max-w-xs truncate">
                            {category.description || "-"}
                          </TableCell>

                          <TableCell>
                            {category.other ? "Yes" : "No"}
                          </TableCell>

                          <TableCell>{category.parentCategory || "-"}</TableCell>

                          <TableCell>{category.productsCount ?? 0}</TableCell>

                          <TableCell>{formatDate(category.createdAt)}</TableCell>
                          <TableCell>{formatDate(category.updatedAt)}</TableCell>

                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleReorder(index, "up")} disabled={index === 0}>
                              ↑
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => handleReorder(index, "down")} disabled={index === filteredCategories.length - 1}>
                              ↓
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => {setSelected(category);setEditOpen(true);}}>
                              Edit
                            </Button>

                            <Button variant="destructive" size="sm" onClick={() => handleDelete(category._id)}>
                              Delete
                            </Button>
                          </TableCell>

                        </TableRow>
                    ))}

                    {filteredCategories.length === 0 && (
                        <TableRow>
                          <TableCell
                              colSpan={10}
                              className="text-center text-sm text-muted-foreground"
                          >
                            No categories found
                          </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
            )}
          </Card>
        </div>
        {selected && (
            <EditCategoryDialog
                open={editOpen}
                setOpen={setEditOpen}
                category={selected}
                onUpdated={fetchCategories}
            />
        )}
      </div>
  );
};

export default AdminCategories;
