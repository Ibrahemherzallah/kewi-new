import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose,} from "@/components/ui/drawer";
import {toast} from "sonner";
import {useLanguage} from "@/contexts/LanguageContext.tsx";
import logo from "../assets/logo.png";

interface PurchaseProduct {
  productId: string;
  quantity: number;
  color?: string;
  variantId?: string;
  id?: string;
  name?: string;
  price?: number;
}

interface StatusUpdateResponse {
  order: Purchase;
  earnedPoints?: number;
  totalPoints?: number;
}

interface Purchase {
  _id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  streetAddress?: string;
  deliveryType?: string;
  notes?: string;
  price: number;
  totalPrice: number;
  numOfItems?: number;
  products: PurchaseProduct[];
  createdAt: string;
  updatedAt: string;
  discount: boolean;
  orderStatus?: "ordered" | "confirmed" | "shipped" | "delivered";
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";

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
  const { language } = useLanguage();
  // const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handlePrintInvoice = (order: Purchase) => {
        const printWindow = window.open("", "_blank", "width=800,height=900");
        if (!printWindow) return;
        let deliveryPrice = 0;

        switch (order?.city) {
          case 'West Bank':
          case 'הגדה המערבית':
          case 'الضفة الغربية':
            deliveryPrice =
                order?.deliveryType === 'مستعجل' ? 20 : 10;
            break;

          case '48 Territories':
          case '48 טריטוריות':
          case 'الداخل':
            deliveryPrice =
                order?.deliveryType === 'مستعجل' ? 70 : 50;
            break;

          case 'Jerusalem':
          case 'יְרוּשָׁלַיִם':
          case 'القدس':
            deliveryPrice =
                order?.deliveryType === 'مستعجل' ? 30 : 20;
            break;

          default:
            deliveryPrice = 0;
        }
        // const deliveryPrice = city ? 'West Bank' : ;
        const dir = language === "ar" ? "rtl" : "ltr";
        const textAlign = language === "ar" ? "right" : "left";

        const createdDate = new Date(order.createdAt).toLocaleString("en-GB", {
            dateStyle: "short",
            timeStyle: "short",
        });

        const html = `
    <html lang="${language}" dir="${dir}">
      <head>
        <title>Invoice - ${order._id}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 32px;
            direction: ${dir};
            text-align: ${textAlign};
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .store-name {
            font-size: 22px;
            font-weight: 700;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin: 16px 0 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 13px;
          }
          th {
            background-color: #f5f5f5;
          }
          .totals {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 280px;
            border-collapse: collapse;
          }
          .totals-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            font-size: 14px;
          }
          .totals-table tr:last-child td {
            font-weight: 700;
          }
          .small {
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="store-name">
              <img src="${logo}" alt="logo" style="width: 25px; height: 25px" />
              ${language === "ar" ? "فاتورة الطلب" : "Order Invoice"}
            </div>
            <div class="small">
              ${language === "ar" ? "رقم الطلب" : "Order ID"}: ${order._id}<br/>
              ${language === "ar" ? "التاريخ" : "Date"}: ${createdDate}
            </div>
          </div>
        </div>

        <div>
          <div class="section-title">
            ${language === "ar" ? "معلومات الزبون" : "Customer Information"}
          </div>
          <div class="small">
            ${language === "ar" ? "الاسم" : "Name"}: ${order.fullName}<br/>
            ${language === "ar" ? "الهاتف" : "Phone"}: ${order.phoneNumber}<br/>
            ${language === "ar" ? "المدينة" : "City"}: ${order.city}<br/>
            ${language === "ar" ? "العنوان" : "Address"}: ${order.streetAddress || "-"}<br/>
            ${language === "ar" ? "نوع التوصيل" : "Delivery type"}: ${order.deliveryType || "-"}
          </div>
        </div>

        <div>
          <div class="section-title">
            ${language === "ar" ? "المنتجات" : "Products"}
          </div>
          <table>
            <thead>
              <tr>
                <th>${language === "ar" ? "المنتج" : "Product"}</th>
                <th>${language === "ar" ? "اللون" : "Color"}</th>
                <th>${language === "ar" ? "الكمية" : "Qty"}</th>
                <th>${language === "ar" ? "سعر القطعة" : "Unit price"}</th>
                <th>${language === "ar" ? "الإجمالي" : "Total"}</th>
              </tr>
            </thead>
            <tbody>
              ${order.products
            .map((p) => {
                const lineTotal = (p.price || 0) * p.quantity;
                return `
                    <tr>
                      <td>${p.name || p.id || ""}</td>
                      <td>${p.color || "-"}</td>
                      <td>${p.quantity}</td>
                      <td>${(p.price || 0).toFixed(2)} ₪</td>
                      <td>${lineTotal.toFixed(2)} ₪</td>
                    </tr>
                  `;
            })
            .join("")}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>${language === "ar" ? "المجموع" : "Subtotal"}</td>
              <td>${order.totalPrice.toFixed(2)} ₪</td>
            </tr>
            <tr>
              <td>${language === "ar" ? "سعر التوصيل" : "Delivery price"}</td>
              <td>${deliveryPrice.toFixed(2)} ₪</td>
            </tr>
            <tr>
              <td>${language === "ar" ? "خصم" : "Discount"}</td>
              <td>${order.discount ? (language === "ar" ? "نعم" : "Yes") : (language === "ar" ? "لا" : "No")}</td>
            </tr>
            <tr>
              <td>${language === "ar" ? "الإجمالي النهائي" : "Final total"}</td>
              <td>${order.totalPrice + deliveryPrice} ₪</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 24px;" class="small">
          ${
                    language === "ar"
                        ? `
              <div style="font-weight:600; margin-bottom:6px;">سياسة الإرجاع والاستبدال:</div>
              <div style="margin-bottom:4px;">
                يُقبل الإرجاع أو الاستبدال خلال 24 ساعة بشرط أن يكون المنتج بحالته الأصلية وبتغليفه الكامل.
              </div>
              <div style="margin-bottom:4px;">
                لا يشمل الإرجاع منتجات العروض أو التصفيات إلا في حال وجود عيب مصنعي.
              </div>
              <ul style="margin:6px 0 0; padding-${dir === "rtl" ? "right" : "left"}: 18px;">
                <li>يتحمل العميل رسوم الشحن إذا لم يكن الخطأ من المتجر.</li>
              </ul>
              <div style="margin-top:4px;">
                يتم فحص المنتج قبل الموافقة، ويُعاد المبلغ حسب وسيلة الدفع خلال المدة المحددة.
              </div>
              `
                        : `
              <div style="font-weight:600; margin-bottom:6px;">Return & Exchange Policy:</div>
              <div style="margin-bottom:4px;">
                Returns or exchanges are accepted within 24 hours, provided the product is in its original condition with complete packaging.
              </div>
              <div style="margin-bottom:4px;">
                Items from sales or clearance are not eligible for return unless there is a manufacturing defect.
              </div>
              <ul style="margin:6px 0 0; padding-left:18px;">
                <li>The customer bears shipping fees if the error is not from the store.</li>
              </ul>
              <div style="margin-top:4px;">
                The product is inspected before approval, and refunds are processed based on the payment method within the specified period.
              </div>
              `
                }
        </div>
        <p class="small" style="margin-top:24px;">
          ${language === "ar"
            ? "شكراً لتسوقكم معنا."
            : "Thank you for shopping with us."}
        </p>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
            // Uncomment if you *want* it to auto-close after printing:
            // window.close();
          };
        </script>
      </body>
    </html>
  `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };
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
        const res = await fetch(`${API_BASE}/admin/api/purchase`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

  const handleUpdateStatus = async (orderId: string, action: "confirm" | "ship") => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast({
          title: language === "ar" ? "غير مسجل" : "Not logged in",
          description:
              language === "ar"
                  ? "الرجاء تسجيل الدخول لتأكيد الطلب"
                  : "Please log in to confirm the order.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/user/api/purchase/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update status");
      }

      // 👇 the backend returns { order, earnedPoints, totalPoints }
      const result: StatusUpdateResponse = await res.json();
      const updatedOrder: Purchase = result.order;

      setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (err: any) {
      console.error("Status update error:", err);
      alert(err?.message || "Error updating order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete order");
      }

      // Remove from UI
      setOrders((prev) => prev.filter((o) => o._id !== orderId));

    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err?.message || "Error deleting order");
    }
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
        order?._id?.toLowerCase().includes(q) ||
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
                      <TableHead>Confirmed</TableHead>
                      <TableHead>Shipped</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Discount</TableHead>
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
                            {/* Confirmed checkbox */}
                            <TableCell>
                              <Checkbox
                                  checked={
                                      order.orderStatus === "confirmed" ||
                                      order.orderStatus === "shipped" ||
                                      order.orderStatus === "delivered"
                                  }
                                  disabled={order.orderStatus !== "ordered"} // only clickable when new
                                  onCheckedChange={() => handleUpdateStatus(order._id, "confirm")}
                              />
                            </TableCell>

                            {/* Shipped checkbox */}
                            <TableCell>
                              <Checkbox
                                  checked={
                                      order.orderStatus === "shipped" ||
                                      order.orderStatus === "delivered"
                                  }
                                  disabled={order.orderStatus !== "confirmed"} // only after confirm
                                  onCheckedChange={() => handleUpdateStatus(order._id, "ship")}
                              />
                            </TableCell>

                            <TableCell>{order.fullName}</TableCell>
                            <TableCell>{order.phoneNumber}</TableCell>
                            <TableCell>{order.city}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell className="font-semibold">
                              {order?.totalPrice?.toFixed(2)} ₪
                            </TableCell>
                            <TableCell>{order?.discount ? "Yes" : 'No'}</TableCell>
                            <TableCell>{order.deliveryType}</TableCell>

                            <TableCell>
                              {order.orderStatus === "delivered"
                                  ? "Delivered"
                                  : order.orderStatus === "shipped"
                                      ? "Shipped"
                                      : order.orderStatus === "confirmed"
                                          ? "Confirmed"
                                          : "Ordered"}
                            </TableCell>

                            <TableCell className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openOrderDrawer(order)}>
                                View
                              </Button>

                              <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order._id)}>
                                Delete
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
          <DrawerContent className="p-6 max-h-[95vh]">
            {selectedOrder && (
                <>
                  <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">
                      Order Details – {selectedOrder._id}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className={'max-h-[500px] overflow-y-auto'}>
                    {/* Customer Info */}
                    <div className="space-y-2 mb-6">
                      <h2 className="text-lg font-semibold">Customer Information</h2>
                      <p><strong>Name:</strong> {selectedOrder.fullName}</p>
                      <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                      <p><strong>City:</strong> {selectedOrder.city}</p>
                      <p><strong>Address:</strong> {selectedOrder.streetAddress}</p>
                      <p><strong>Delivery:</strong> {selectedOrder.deliveryType}</p>
                      {selectedOrder?.paymentMethod && (
                          <p><strong>Payment Method:</strong> {selectedOrder?.paymentMethod}</p>
                      )}
                      {selectedOrder?.notes && (
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
                            {/*testtttt*/}
                            <p>
                              <strong>Product ID:</strong>{" "}
                              <span onClick={() => handleCopy(p.id)} className="cursor-pointer text-primary hover:underline">
                                {p.id}
                              </span>
                              {copiedId === p.id && (
                                  <span className="ml-2 text-green-500 text-sm">✓ Copied</span>
                              )}
                            </p>
                            <p><strong>Product Name:</strong> {p.name}</p>
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

                  </div>

                  <DrawerFooter>
                    {selectedOrder && (
                        <Button
                            onClick={() => handlePrintInvoice(selectedOrder)}
                            className="w-full sm:w-auto"
                        >
                          {language === "ar" ? "طباعة الفاتورة" : "Print invoice"}
                        </Button>
                    )}

                    <DrawerClose asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        {language === "ar" ? "إغلاق" : "Close"}
                      </Button>
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
