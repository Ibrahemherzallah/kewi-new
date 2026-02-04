import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose,} from "@/components/ui/drawer";
interface PurchaseProduct {
  productId: string;
  quantity: number;
  color?: string;
  variantId?: string;
  id?: string;        // composite cart id, optional
  price?: number;     // unit price at time of purchase
}

interface Purchase {
  _id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  streetAddress?: string;
  deliveryType?: string;
  notes?: string;
  price: number;         // or totalPrice, depending on how you use it
  totalPrice: number;
  numOfItems?: number;
  products: PurchaseProduct[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "http://localhost:5001"; // 🔁 change if needed

const AdminOrders = () => {
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(
      new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openOrderDrawer = (order: Purchase) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };
  // 🔹 Fetch real orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/admin/purchase`, {
          method: "GET",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
              errData?.message || "Failed to fetch orders from server"
          );
        }

        const data: Purchase[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(
            err?.message || "An error occurred while fetching orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleToggleComplete = (orderId: string) => {
    setCompletedOrders((prev) => {
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
      case "Pending":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // 🔎 Filter orders by id, customer, phone or city
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
        order._id.toLowerCase().includes(q) ||
        (order.fullName || "").toLowerCase().includes(q) ||
        (order.phoneNumber || "").toLowerCase().includes(q) ||
        (order.city || "").toLowerCase().includes(q)
    );
  });

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
                <p className="text-muted-foreground">
                  Track & manage customer orders
                </p>
              </div>
            </div>
            {/* You can turn this into "Export" or something later */}
            <Button disabled>
              {/* <Plus className="mr-2 h-4 w-4" /> */}
              New Order
            </Button>
          </div>

          <Card className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search by order ID, customer, phone, or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
              </div>
            </div>

            {loading && (
                <div className="py-8 text-center text-muted-foreground">
                  Loading orders...
                </div>
            )}

            {error && !loading && (
                <div className="py-4 text-sm text-red-500">{error}</div>
            )}

            {!loading && !error && filteredOrders.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No orders found.
                </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Complete</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const status = completedOrders.has(order._id)
                          ? "Delivered"
                          : "Pending";

                      return (
                          <TableRow key={order._id}>
                            <TableCell>
                              <Checkbox
                                  checked={completedOrders.has(order._id)}
                                  onCheckedChange={() =>
                                      handleToggleComplete(order._id)
                                  }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                {order._id}
                              </div>
                            </TableCell>
                            <TableCell>{order.fullName}</TableCell>
                            <TableCell>{order.phoneNumber}</TableCell>
                            <TableCell>{order.city}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell className="font-semibold">
                              {order?.totalPrice?.toFixed(2)} ₪
                            </TableCell>
                            <TableCell>{order.deliveryType}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => openOrderDrawer(order)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
            )}
          </Card>
        </div>
        {/* Order Details Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="p-6 max-h-[85vh] overflow-y-auto">
            {selectedOrder && (
                <>
                  <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">
                      Order Details – {selectedOrder._id}
                    </DrawerTitle>
                  </DrawerHeader>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-6">
                    <h2 className="text-lg font-semibold">Customer Information</h2>
                    <p><strong>Name:</strong> {selectedOrder.fullName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                    <p><strong>City:</strong> {selectedOrder.city}</p>
                    <p><strong>Address:</strong> {selectedOrder.streetAddress}</p>
                    <p><strong>Delivery:</strong> {selectedOrder.deliveryType}</p>
                    {selectedOrder.notes && (
                        <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                    )}
                  </div>

                  {/* Products */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Products</h2>

                    {selectedOrder.products.map((p, index) => (
                        <div
                            key={index}
                            className="border border-border rounded-lg p-4 bg-card"
                        >
                          <p><strong>Product ID:</strong> {p.productId}</p>
                          <p><strong>Quantity:</strong> {p.quantity}</p>
                          <p><strong>Color:</strong> {p.color || "—"}</p>
                          <p><strong>Variant ID:</strong> {p.variantId || "—"}</p>
                          <p><strong>Unit Price:</strong> {p.price?.toFixed(2)} ₪</p>
                        </div>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                    <p className="text-lg font-bold">
                      Total: {selectedOrder.totalPrice.toFixed(2)} ₪
                    </p>
                  </div>

                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </>
            )}
          </DrawerContent>
        </Drawer>

      </div>
  );
};

export default AdminOrders;
