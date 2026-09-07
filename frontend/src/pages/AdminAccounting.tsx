import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  ArrowLeft, TrendingUp, DollarSign, Package, BarChart3,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const STATS_API = `${API_BASE}/admin/api/purchases/accounting`;

const STATUS_COLORS: Record<string, string> = {
  ordered:   "secondary",
  confirmed: "outline",
  shipped:   "default",
  delivered: "default",
};

type MonthlyStat  = { month: string; revenue: number; orders: number };
type YearlyStat   = { year: number; revenue: number; orders: number };
type StatusStat   = { status: string; count: number };

type Stats = {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number };
  monthly: MonthlyStat[];
  yearly: YearlyStat[];
  statusBreakdown: StatusStat[];
  selectedYear: number;
};

const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const AdminAccounting = () => {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [year, setYear]         = useState(new Date().getFullYear());
  const token = localStorage.getItem("token");

  const fetchStats = async (y: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${STATS_API}?year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: Stats = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(year); }, [year]);

  const availableYears = stats?.yearly.map((y) => y.year) || [new Date().getFullYear()];

  return (
      <div className="min-h-screen bg-background">
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
              <p className="text-muted-foreground">
                Revenue from shipped &amp; delivered orders
              </p>
            </div>
          </div>

          {error && <p className="text-destructive mb-4">{error}</p>}

          {loading ? (
              <p className="text-muted-foreground">Loading...</p>
          ) : stats && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">₪{fmt(stats.summary.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Shipped + Delivered</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.summary.totalOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">₪{fmt(stats.summary.avgOrderValue)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Per order</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Orders by Status</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2 pt-1">
                      {stats.statusBreakdown.map((s) => (
                          <div key={s.status} className="flex items-center gap-1">
                            <Badge variant={STATUS_COLORS[s.status] as any}>
                              {s.status}
                            </Badge>
                            <span className="text-sm font-semibold">{s.count}</span>
                          </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Year selector */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Year:</span>
                  {availableYears.map((y) => (
                      <Button
                          key={y}
                          size="sm"
                          variant={y === year ? "default" : "outline"}
                          onClick={() => setYear(y)}
                      >
                        {y}
                      </Button>
                  ))}
                </div>

                {/* Monthly Revenue Chart */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Monthly Revenue — {year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.monthly} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            formatter={(v: number) => [`₪${fmt(v)}`, "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Orders Chart */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Monthly Orders — {year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={stats.monthly} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip formatter={(v: number) => [v, "Orders"]} />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Yearly Summary Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Avg / Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.yearly.map((y) => (
                            <TableRow key={y.year}>
                              <TableCell className="font-semibold">{y.year}</TableCell>
                              <TableCell>{y.orders}</TableCell>
                              <TableCell>₪{fmt(y.revenue)}</TableCell>
                              <TableCell>
                                ₪{fmt(y.orders > 0 ? y.revenue / y.orders : 0)}
                              </TableCell>
                            </TableRow>
                        ))}
                        {stats.yearly.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No data yet
                              </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
          )}
        </div>
      </div>
  );
};

export default AdminAccounting;