import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/data/mockOrders";
import { ArrowLeft, TrendingUp, DollarSign, Package, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminAccounting = () => {
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0]);

  // Calculate totals
  const calculateOrderTotals = (order: typeof selectedOrder) => {
    const totalCostUSD = order.items.reduce((sum, item) => sum + item.buyPriceUSD * item.qty, 0);
    const totalWholesaleRevenue = order.items.reduce((sum, item) => sum + item.wholesalePrice * item.qty, 0);
    const totalRetailRevenue = order.items.reduce((sum, item) => sum + item.retailPrice * item.qty, 0);
    const warehouseToKewiProfit = order.items.reduce((sum, item) => sum + (item.wholesalePrice - item.buyPriceUSD) * item.qty, 0);
    const kewiToCustomerProfit = order.items.reduce((sum, item) => sum + (item.retailPrice - item.wholesalePrice) * item.qty, 0);
    const totalProfit = warehouseToKewiProfit + kewiToCustomerProfit;

    return {
      totalCostUSD,
      totalWholesaleRevenue,
      totalRetailRevenue,
      warehouseToKewiProfit,
      kewiToCustomerProfit,
      totalProfit,
    };
  };

  const totals = calculateOrderTotals(selectedOrder);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-muted-foreground">Track orders, profits, and inventory flow</p>
          </div>
        </div>

        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order: {selectedOrder.orderId}</CardTitle>
                <p className="text-muted-foreground text-sm">Supplier: {selectedOrder.supplier}</p>
              </div>
              <Badge>{selectedOrder.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Total ({selectedOrder.currency})</p>
                <p className="text-2xl font-bold">{selectedOrder.totalInCurrency.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Converted to USD</p>
                <p className="text-2xl font-bold">${selectedOrder.convertedToUSD.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange Rate (ILS→USD)</p>
                <p className="text-lg font-semibold">{selectedOrder.fixedShekelToUSD} → {selectedOrder.actualShekelToUSD}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">{selectedOrder.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cost (USD)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.totalCostUSD.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wholesale Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totals.totalWholesaleRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Retail Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">${totals.totalRetailRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${totals.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Warehouse→Kewi: ${totals.warehouseToKewiProfit.toFixed(2)} | Kewi→Customer: ${totals.kewiToCustomerProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Cost/Unit (USD)</TableHead>
                  <TableHead>Wholesale Price</TableHead>
                  <TableHead>Retail Price</TableHead>
                  <TableHead>Warehouse Qty</TableHead>
                  <TableHead>Kewi Qty</TableHead>
                  <TableHead>Line Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOrder.items.map((item) => {
                  const lineProfit = (item.wholesalePrice - item.buyPriceUSD + item.retailPrice - item.wholesalePrice) * item.qty;
                  return (
                    <TableRow key={item.sku}>
                      <TableCell>
                        <img src={item.images[0]} alt={item.name} className="h-12 w-12 object-cover rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-sm">{item.barcode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.sku}</Badge>
                      </TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>${item.buyPriceUSD.toFixed(2)}</TableCell>
                      <TableCell>${item.wholesalePrice.toFixed(2)}</TableCell>
                      <TableCell>${item.retailPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.warehouseQty}</TableCell>
                      <TableCell>{item.kewiQty}</TableCell>
                      <TableCell className="text-success font-semibold">${lineProfit.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAccounting;
