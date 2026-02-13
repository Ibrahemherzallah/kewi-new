import {Link, useNavigate} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {Package, ShoppingBag, BarChart3, Users, ArrowLeft, Tag, FolderTree, Building2, ClipboardList, LogOut} from "lucide-react";
import {useLanguage} from "@/contexts/LanguageContext.tsx";
import {LanguageToggle} from "@/components/LanguageToggle.tsx";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";
import { useEffect, useState } from "react";
import axios from "axios";


const AdminDashboard = () => {

  const navigate = useNavigate();
  const { language } = useLanguage();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    wholesalers: 0,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    navigate("/");
  };
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
            "http://localhost:5001/admin/dashboard-stats",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pb-12 pt-5">
        <div className="mb-8 flex items-center justify-between">
          <div className={`flex-column gap-5`}>
            <Link to="/" className={`flex mb-5`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your Kewi store</p>
            </div>
          </div>
          <div className={`flex gap-3`}>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              {language === "ar" ? "تسجيل الخروج" : "Logout"}
            </Button>
          </div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 space-y-3 border-border hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">{stats.totalProducts}</span>
            </div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </Card>

          <Card className="p-6 space-y-3 border-border hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-2xl font-bold">{stats.pendingOrders}</span>
            </div>
            <div className="text-sm text-muted-foreground">Pending Orders</div>
          </Card>

          <Card className="p-6 space-y-3 border-border hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <span className="text-2xl font-bold">${stats.monthlyRevenue}</span>
            </div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </Card>

          <Card className="p-6 space-y-3 border-border hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <span className="text-2xl font-bold">{stats.wholesalers}</span>
            </div>
            <div className="text-sm text-muted-foreground">Wholesalers</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/products">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Products</h3>
                  <p className="text-muted-foreground">Manage inventory & stock</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/accounting">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Accounting</h3>
                  <p className="text-muted-foreground">Orders, profits & analytics</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/brands">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Brands</h3>
                  <p className="text-muted-foreground">Manage product brands</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/categories">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderTree className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Categories</h3>
                  <p className="text-muted-foreground">Organize product categories</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/wholesalers">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Wholesalers</h3>
                  <p className="text-muted-foreground">Manage wholesale clients</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/orders">
            <Card className="p-8 hover:shadow-medium transition-all cursor-pointer group border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Orders</h3>
                  <p className="text-muted-foreground">Track & manage orders</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
