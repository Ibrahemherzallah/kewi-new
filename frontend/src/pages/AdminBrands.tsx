import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Tag } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddBrandDialog } from "@/components/admin/AddBrandDialog";

const mockBrands = [
  { id: 1, name: "Brand A", productsCount: 45, status: "Active" },
  { id: 2, name: "Brand B", productsCount: 32, status: "Active" },
  { id: 3, name: "Brand C", productsCount: 28, status: "Active" },
  { id: 4, name: "Brand D", productsCount: 15, status: "Inactive" },
];

const AdminBrands = () => {
  const [search, setSearch] = useState("");

  const filteredBrands = mockBrands.filter(brand =>
    brand.name.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-4xl font-bold mb-2">Brands</h1>
              <p className="text-muted-foreground">Manage product brands</p>
            </div>
          </div>
          <AddBrandDialog />
        </div>

        <Card className="p-6">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {brand.name}
                    </div>
                  </TableCell>
                  <TableCell>{brand.productsCount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      brand.status === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {brand.status}
                    </span>
                  </TableCell>
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

export default AdminBrands;
