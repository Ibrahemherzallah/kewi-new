import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, FolderTree } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddCategoryDialog } from "@/components/admin/AddCategoryDialog";

const mockCategories = [
  { id: 1, name: "Fruits", productsCount: 28, parentCategory: null },
  { id: 2, name: "Vegetables", productsCount: 35, parentCategory: null },
  { id: 3, name: "Dairy", productsCount: 22, parentCategory: null },
  { id: 4, name: "Beverages", productsCount: 18, parentCategory: null },
  { id: 5, name: "Citrus", productsCount: 12, parentCategory: "Fruits" },
];

const AdminCategories = () => {
  const [search, setSearch] = useState("");

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <p className="text-muted-foreground">Organize product categories</p>
            </div>
          </div>
          <AddCategoryDialog />
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell>{category.parentCategory || "-"}</TableCell>
                  <TableCell>{category.productsCount}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminCategories;
