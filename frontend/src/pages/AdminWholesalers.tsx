import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddWholesalerDialog } from "@/components/admin/AddWholesalerDialog";

const mockWholesalers = [
  { id: 1, name: "Wholesale Co A", contact: "contact@wholesalea.com", phone: "+1234567890", totalOrders: 45, status: "Active" },
  { id: 2, name: "Wholesale Co B", contact: "info@wholesaleb.com", phone: "+1234567891", totalOrders: 32, status: "Active" },
  { id: 3, name: "Wholesale Co C", contact: "sales@wholesalec.com", phone: "+1234567892", totalOrders: 28, status: "Active" },
  { id: 4, name: "Wholesale Co D", contact: "orders@wholesaled.com", phone: "+1234567893", totalOrders: 15, status: "Inactive" },
];

const AdminWholesalers = () => {
  const [search, setSearch] = useState("");

  const filteredWholesalers = mockWholesalers.filter(wholesaler =>
    wholesaler.name.toLowerCase().includes(search.toLowerCase()) ||
    wholesaler.contact.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-4xl font-bold mb-2">Wholesalers</h1>
              <p className="text-muted-foreground">Manage wholesale clients</p>
            </div>
          </div>
          <AddWholesalerDialog />
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search wholesalers..."
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
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWholesalers.map((wholesaler) => (
                <TableRow key={wholesaler.id}>
                  <TableCell>{wholesaler.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {wholesaler.name}
                    </div>
                  </TableCell>
                  <TableCell>{wholesaler.contact}</TableCell>
                  <TableCell>{wholesaler.phone}</TableCell>
                  <TableCell>{wholesaler.totalOrders}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      wholesaler.status === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {wholesaler.status}
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

export default AdminWholesalers;
