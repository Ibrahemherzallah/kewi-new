import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Search, ClipboardList } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", date: "2024-01-15", total: "$250.00", status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", date: "2024-01-16", total: "$180.50", status: "Pending" },
  { id: "ORD-003", customer: "Bob Johnson", date: "2024-01-17", total: "$420.00", status: "Processing" },
  { id: "ORD-004", customer: "Alice Brown", date: "2024-01-18", total: "$95.00", status: "Delivered" },
  { id: "ORD-005", customer: "Charlie Wilson", date: "2024-01-19", total: "$310.75", status: "Pending" },
];

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());

  const filteredOrders = mockOrders.filter(order =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleComplete = (orderId: string) => {
    setCompletedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-primary/10 text-primary";
      case "Processing":
        return "bg-warning/10 text-warning";
      case "Pending":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
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
              <h1 className="text-4xl font-bold mb-2">Orders</h1>
              <p className="text-muted-foreground">Track & manage orders</p>
            </div>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complete</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={completedOrders.has(order.id)}
                      onCheckedChange={() => handleToggleComplete(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      {order.id}
                    </div>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="font-semibold">{order.total}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View</Button>
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

export default AdminOrders;
